import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { Prisma, BuyerType, FinancingStatus } from "@/generated/prisma/client";
import { TransactionStatus } from "@/generated/prisma/enums";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getClientIp, getUserAgent, logAudit } from "@/lib/audit";
import { canCreateTransaction, incrementTransactionCount } from "@/lib/stripe";
import { sendTransactionCreatedEmail } from "@/lib/email";

const createTransactionSchema = z
  .object({
    property: z.object({
      street: z.string().trim().min(1, "Street is required"),
      city: z.string().trim().min(1, "City is required"),
      county: z.string().trim().min(1, "County is required"),
      state: z.string().trim().min(2, "State is required"),
      zip: z
        .string()
        .trim()
        .regex(/^\d{5}(?:-\d{4})?$/, "ZIP must be valid"),
    }),
    propertyType: z.enum([
      "single_family",
      "condo",
      "multi_family",
      "townhouse",
      "land",
      "commercial",
    ]),
    fileNumber: z.string().trim().max(100).optional(),
    buyerType: z.nativeEnum(BuyerType),
    entityName: z.string().trim().max(200).optional(),
    formationState: z.string().trim().max(40).optional(),
    purchasePrice: z.number().positive("Purchase price must be greater than 0"),
    closingDate: z.string().date("Closing date must be a valid date"),
    financingStatus: z.nativeEnum(FinancingStatus),
  })
  .superRefine((value, ctx) => {
    const entityBuyer = value.buyerType !== BuyerType.INDIVIDUAL;
    if (entityBuyer && !value.entityName?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["entityName"],
        message: "Entity/trust name is required for non-individual buyers",
      });
    }
    if (entityBuyer && !value.formationState?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["formationState"],
        message: "State of formation is required for non-individual buyers",
      });
    }
  });

export async function POST(request: NextRequest) {
  try {
    const { user, organization } = await resolveUser();
    const limitCheck = await canCreateTransaction(organization.id);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: limitCheck.message,
          current: limitCheck.current,
          limit: limitCheck.limit,
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = createTransactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const payload = parsed.data;
    const transaction = await prisma.transaction.create({
      data: {
        org_id: organization.id,
        created_by_id: user.id,
        status: TransactionStatus.SCREENING,
        file_number: payload.fileNumber?.trim() || null,
        property_address: payload.property.street,
        property_city: payload.property.city,
        property_county: payload.property.county,
        property_state: payload.property.state,
        property_zip: payload.property.zip,
        buyer_type: payload.buyerType,
        purchase_price: new Prisma.Decimal(payload.purchasePrice.toFixed(2)),
        closing_date: new Date(payload.closingDate),
        financing_status: payload.financingStatus,
        data_collection: {
          screening: {
            property_type: payload.propertyType,
            formation_state:
              payload.buyerType === BuyerType.INDIVIDUAL
                ? null
                : (payload.formationState ?? null),
            entity_or_trust_name:
              payload.buyerType === BuyerType.INDIVIDUAL
                ? null
                : (payload.entityName ?? null),
          },
        },
        ...(payload.buyerType === BuyerType.INDIVIDUAL
          ? {}
          : payload.buyerType === BuyerType.TRUST
            ? {
                trust_detail: {
                  create: {
                    trust_name: payload.entityName ?? "Unnamed trust",
                  },
                },
              }
            : {
                entity_detail: {
                  create: {
                    entity_name: payload.entityName ?? "Unnamed entity",
                    entity_type: payload.buyerType,
                    formation_state: payload.formationState ?? null,
                    formation_country:
                      payload.formationState === "Foreign" ? "FOREIGN" : "US",
                  },
                },
              }),
      },
      select: {
        id: true,
        status: true,
        org_id: true,
        assigned_to_id: true,
        file_number: true,
        property_address: true,
        buyer_type: true,
      },
    });

    try {
      await logAudit({
        orgId: transaction.org_id,
        userId: user.id,
        action: "transaction.created",
        details: {
          file_number: transaction.file_number,
          property_address: transaction.property_address,
          buyer_type: transaction.buyer_type,
        },
        transactionId: transaction.id,
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      });
    } catch (auditError) {
      console.error("[audit] Failed:", auditError);
    }

    if (transaction.assigned_to_id) {
      try {
        const assignee = await prisma.user.findUnique({
          where: { id: transaction.assigned_to_id },
          select: { email: true, first_name: true },
        });
        if (assignee?.email) {
          await sendTransactionCreatedEmail(assignee.email, {
            recipientName: assignee.first_name || "Team Member",
            propertyAddress: transaction.property_address,
            fileNumber: transaction.file_number,
            transactionId: transaction.id,
          });
        }
      } catch (emailError) {
        console.error("[email] Failed to send transaction_created:", emailError);
      }
    }

    await incrementTransactionCount(organization.id);

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create transaction";
    const status =
      message === "Unauthorized" || message === "Organization required"
        ? 401
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
