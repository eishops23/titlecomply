import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { BuyerType } from "@/generated/prisma/enums";
import type {
  EntityExtractionResult,
  GovernmentIdExtractionResult,
  TrustExtractionResult,
} from "@/lib/claude";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/encryption";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({ id: z.string().uuid() });
const applySchema = z.object({ fields: z.array(z.string()).optional() });

type ParsedExtraction = {
  type: "entity" | "trust" | "government_id" | "other";
  data: EntityExtractionResult | TrustExtractionResult | GovernmentIdExtractionResult;
};

function mapEntityType(type: string | null): BuyerType {
  if (!type) return BuyerType.LLC;
  const normalized = type.toUpperCase();
  if (normalized.includes("LLC")) return BuyerType.LLC;
  if (normalized.includes("CORP")) return BuyerType.CORPORATION;
  if (normalized.includes("PARTNER")) return BuyerType.PARTNERSHIP;
  return BuyerType.OTHER_ENTITY;
}

function shouldApplyField(fields: string[] | undefined, key: string): boolean {
  if (!fields || fields.length === 0) return true;
  return fields.includes(key);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { organization } = await resolveUser();
    const parsedParams = paramsSchema.safeParse(await context.params);
    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsedParams.error.flatten() },
        { status: 400 },
      );
    }

    const body = applySchema.safeParse(await request.json());
    if (!body.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: body.error.flatten() },
        { status: 400 },
      );
    }

    const document = await prisma.document.findFirst({
      where: { id: parsedParams.data.id, transaction: { org_id: organization.id } },
      include: { transaction: { select: { id: true } } },
    });
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    if (document.extraction_status !== "COMPLETED" || !document.extraction_result) {
      return NextResponse.json({ error: "No extraction result available" }, { status: 400 });
    }

    const result = document.extraction_result as unknown as ParsedExtraction;
    const fields = body.data.fields;
    const transactionId = document.transaction.id;

    if (result.type === "entity") {
      const data = result.data as EntityExtractionResult;
      await prisma.entityDetail.upsert({
        where: { transaction_id: transactionId },
        create: {
          transaction_id: transactionId,
          entity_name: data.entity_name || "Unknown entity",
          entity_type: mapEntityType(data.entity_type),
          formation_state: data.formation_state,
          formation_date: data.formation_date ? new Date(data.formation_date) : null,
          ein: data.ein ? encrypt(data.ein) : null,
          registered_agent_name: data.registered_agent?.name || null,
          registered_agent_address: data.registered_agent?.address || null,
          principal_place_of_business: data.principal_place_of_business,
        },
        update: {
          entity_name: shouldApplyField(fields, "entity_name")
            ? (data.entity_name ?? undefined)
            : undefined,
          entity_type:
            shouldApplyField(fields, "entity_type") && data.entity_type
              ? mapEntityType(data.entity_type)
              : undefined,
          formation_state: shouldApplyField(fields, "formation_state")
            ? (data.formation_state ?? undefined)
            : undefined,
          formation_date:
            shouldApplyField(fields, "formation_date") && data.formation_date
              ? new Date(data.formation_date)
              : undefined,
          ein:
            shouldApplyField(fields, "ein") && data.ein
              ? encrypt(data.ein)
              : undefined,
          registered_agent_name: shouldApplyField(fields, "registered_agent_name")
            ? (data.registered_agent?.name ?? undefined)
            : undefined,
          registered_agent_address: shouldApplyField(fields, "registered_agent_address")
            ? (data.registered_agent?.address ?? undefined)
            : undefined,
          principal_place_of_business: shouldApplyField(fields, "principal_place_of_business")
            ? (data.principal_place_of_business ?? undefined)
            : undefined,
        },
      });

      if (shouldApplyField(fields, "members") && data.members.length > 0) {
        for (const member of data.members) {
          if (!member.name) continue;
          const [firstName = "", ...rest] = member.name.trim().split(/\s+/);
          const lastName = rest.join(" ");
          if (!firstName || !lastName) continue;

          const existing = await prisma.beneficialOwner.findFirst({
            where: {
              transaction_id: transactionId,
              first_name: firstName,
              last_name: lastName,
            },
          });
          if (existing) continue;

          await prisma.beneficialOwner.create({
            data: {
              transaction_id: transactionId,
              first_name: firstName,
              last_name: lastName,
              ownership_percentage: member.ownership_percentage ?? 0,
              ownership_type: member.role || "Member",
            },
          });
        }
      }
    } else if (result.type === "trust") {
      const data = result.data as TrustExtractionResult;
      await prisma.trustDetail.upsert({
        where: { transaction_id: transactionId },
        create: {
          transaction_id: transactionId,
          trust_name: data.trust_name || "Unknown trust",
          trust_type: data.trust_type,
          trust_date: data.trust_date ? new Date(data.trust_date) : null,
          trustee_name: data.trustee?.name || null,
          trustee_address: data.trustee?.address || null,
          grantor_name: data.grantor?.name || null,
          grantor_address: data.grantor?.address || null,
          beneficiaries: data.beneficiaries,
          ein: data.ein ? encrypt(data.ein) : null,
        },
        update: {
          trust_name: shouldApplyField(fields, "trust_name")
            ? (data.trust_name ?? undefined)
            : undefined,
          trust_type: shouldApplyField(fields, "trust_type")
            ? (data.trust_type ?? undefined)
            : undefined,
          trust_date:
            shouldApplyField(fields, "trust_date") && data.trust_date
              ? new Date(data.trust_date)
              : undefined,
          trustee_name: shouldApplyField(fields, "trustee_name")
            ? (data.trustee?.name ?? undefined)
            : undefined,
          trustee_address: shouldApplyField(fields, "trustee_address")
            ? (data.trustee?.address ?? undefined)
            : undefined,
          grantor_name: shouldApplyField(fields, "grantor_name")
            ? (data.grantor?.name ?? undefined)
            : undefined,
          grantor_address: shouldApplyField(fields, "grantor_address")
            ? (data.grantor?.address ?? undefined)
            : undefined,
          beneficiaries: shouldApplyField(fields, "beneficiaries")
            ? data.beneficiaries
            : undefined,
          ein:
            shouldApplyField(fields, "ein") && data.ein
              ? encrypt(data.ein)
              : undefined,
        },
      });
    } else if (result.type === "government_id") {
      const data = result.data as GovernmentIdExtractionResult;
      if (data.full_name) {
        const [firstName = "", ...rest] = data.full_name.trim().split(/\s+/);
        const lastName = rest.join(" ");
        if (firstName && lastName) {
          const existing = await prisma.beneficialOwner.findFirst({
            where: { transaction_id: transactionId, first_name: firstName, last_name: lastName },
          });
          if (!existing) {
            await prisma.beneficialOwner.create({
              data: {
                transaction_id: transactionId,
                first_name: firstName,
                last_name: lastName,
                date_of_birth: data.date_of_birth ? encrypt(data.date_of_birth) : null,
                id_type: data.id_type,
                id_number: data.id_number ? encrypt(data.id_number) : null,
                id_state: data.issuing_state,
                id_country: data.issuing_country,
                id_expiration: data.expiration_date ? new Date(data.expiration_date) : null,
                address: data.address,
                ownership_percentage: 0,
              },
            });
          }
        }
      }
    }

    await prisma.document.update({
      where: { id: document.id },
      data: { verified: true, verified_at: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[documents/apply] Error:", error);
    return NextResponse.json({ error: "Failed to apply extraction" }, { status: 500 });
  }
}
