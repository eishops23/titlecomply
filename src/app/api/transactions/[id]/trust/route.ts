import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { logAudit } from "@/lib/audit";

const trustSchema = z.object({
  trustName: z.string().trim().min(1),
  trustType: z.string().trim().optional(),
  trustDate: z.string().date().optional(),
  trusteeName: z.string().trim().optional(),
  trusteeAddress: z.string().trim().optional(),
  grantorName: z.string().trim().optional(),
  grantorAddress: z.string().trim().optional(),
  ein: z.string().trim().optional(),
});

async function upsertTrust(
  transactionId: string,
  data: z.infer<typeof trustSchema>,
) {
  const existing = await prisma.trustDetail.findUnique({
    where: { transaction_id: transactionId },
    select: { id: true },
  });
  if (existing) {
    return prisma.trustDetail.update({
      where: { transaction_id: transactionId },
      data: {
        trust_name: data.trustName,
        trust_type: data.trustType || null,
        trust_date: data.trustDate ? new Date(data.trustDate) : null,
        trustee_name: data.trusteeName || null,
        trustee_address: data.trusteeAddress || null,
        grantor_name: data.grantorName || null,
        grantor_address: data.grantorAddress || null,
        ein: data.ein ? encrypt(data.ein) : null,
      },
      select: { id: true, transaction_id: true },
    });
  }

  return prisma.trustDetail.create({
    data: {
      transaction_id: transactionId,
      trust_name: data.trustName,
      trust_type: data.trustType || null,
      trust_date: data.trustDate ? new Date(data.trustDate) : null,
      trustee_name: data.trusteeName || null,
      trustee_address: data.trusteeAddress || null,
      grantor_name: data.grantorName || null,
      grantor_address: data.grantorAddress || null,
      ein: data.ein ? encrypt(data.ein) : null,
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
    const payload = trustSchema.safeParse(await request.json());
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

    const trust = await upsertTrust(tx.id, payload.data);

    await logAudit({
      orgId: organization.id,
      userId: user.id,
      transactionId: tx.id,
      action: "transaction.trust.upserted",
      details: { trust_id: trust.id },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    return NextResponse.json({ trust });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save trust";
    const status =
      message === "Unauthorized" || message === "Organization required" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
