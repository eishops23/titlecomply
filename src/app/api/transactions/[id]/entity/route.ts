import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { BuyerType } from "@/generated/prisma/enums";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { logAudit } from "@/lib/audit";

const entitySchema = z.object({
  entityName: z.string().trim().min(1),
  entityType: z.enum([BuyerType.LLC, BuyerType.CORPORATION, BuyerType.PARTNERSHIP, BuyerType.OTHER_ENTITY]),
  ein: z.string().trim().optional(),
  formationState: z.string().trim().optional(),
  formationDate: z.string().date().optional(),
  registeredAgentName: z.string().trim().optional(),
  registeredAgentAddress: z.string().trim().optional(),
  principalPlaceOfBusiness: z.string().trim().optional(),
  businessPurpose: z.string().trim().optional(),
});

async function upsertEntity(
  transactionId: string,
  data: z.infer<typeof entitySchema>,
) {
  const existing = await prisma.entityDetail.findUnique({
    where: { transaction_id: transactionId },
    select: { id: true },
  });

  if (existing) {
    return prisma.entityDetail.update({
      where: { transaction_id: transactionId },
      data: {
        entity_name: data.entityName,
        entity_type: data.entityType,
        ein: data.ein ? encrypt(data.ein) : null,
        formation_state: data.formationState || null,
        formation_country: data.formationState === "Foreign" ? "FOREIGN" : "US",
        formation_date: data.formationDate ? new Date(data.formationDate) : null,
        registered_agent_name: data.registeredAgentName || null,
        registered_agent_address: data.registeredAgentAddress || null,
        principal_place_of_business: data.principalPlaceOfBusiness || null,
        business_purpose: data.businessPurpose || null,
      },
      select: { id: true, transaction_id: true },
    });
  }

  return prisma.entityDetail.create({
    data: {
      transaction_id: transactionId,
      entity_name: data.entityName,
      entity_type: data.entityType,
      ein: data.ein ? encrypt(data.ein) : null,
      formation_state: data.formationState || null,
      formation_country: data.formationState === "Foreign" ? "FOREIGN" : "US",
      formation_date: data.formationDate ? new Date(data.formationDate) : null,
      registered_agent_name: data.registeredAgentName || null,
      registered_agent_address: data.registeredAgentAddress || null,
      principal_place_of_business: data.principalPlaceOfBusiness || null,
      business_purpose: data.businessPurpose || null,
    },
    select: { id: true, transaction_id: true },
  });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return handle(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return handle(request, context);
}

async function handle(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { user, organization } = await resolveUser();
    const { id } = await context.params;
    const payload = entitySchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: payload.error.flatten() },
        { status: 400 },
      );
    }

    const tx = await prisma.transaction.findFirst({
      where: { id, org_id: organization.id },
      select: { id: true },
    });
    if (!tx) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const entity = await upsertEntity(tx.id, payload.data);

    await logAudit({
      orgId: organization.id,
      userId: user.id,
      transactionId: tx.id,
      action: "transaction.entity.upserted",
      details: { entity_id: entity.id },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    return NextResponse.json({ entity });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save entity";
    const status =
      message === "Unauthorized" || message === "Organization required" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
