import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { logAudit } from "@/lib/audit";

const ownerSchema = z.object({
  id: z.string().uuid().optional(),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  dateOfBirth: z.string().trim().optional(),
  ssnItin: z.string().trim().optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  zip: z.string().trim().optional(),
  country: z.string().trim().optional(),
  ownershipPercentage: z.number().min(0).max(100),
  idType: z.string().trim().optional(),
  idNumber: z.string().trim().optional(),
  idState: z.string().trim().optional(),
  idCountry: z.string().trim().optional(),
  idExpiration: z.string().date().optional(),
});

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
    const payload = ownerSchema.safeParse(await request.json());
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

    const data = payload.data;
    const owner = data.id
      ? await prisma.beneficialOwner.update({
          where: { id: data.id, transaction_id: tx.id },
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            date_of_birth: data.dateOfBirth ? encrypt(data.dateOfBirth) : null,
            ssn_itin: data.ssnItin ? encrypt(data.ssnItin) : null,
            address: data.address || null,
            city: data.city || null,
            state: data.state || null,
            zip: data.zip || null,
            country: data.country || "US",
            ownership_percentage: data.ownershipPercentage,
            id_type: data.idType || null,
            id_number: data.idNumber ? encrypt(data.idNumber) : null,
            id_state: data.idState || null,
            id_country: data.idCountry || null,
            id_expiration: data.idExpiration ? new Date(data.idExpiration) : null,
          },
          select: { id: true, transaction_id: true, ownership_percentage: true },
        })
      : await prisma.beneficialOwner.create({
          data: {
            transaction_id: tx.id,
            first_name: data.firstName,
            last_name: data.lastName,
            date_of_birth: data.dateOfBirth ? encrypt(data.dateOfBirth) : null,
            ssn_itin: data.ssnItin ? encrypt(data.ssnItin) : null,
            address: data.address || null,
            city: data.city || null,
            state: data.state || null,
            zip: data.zip || null,
            country: data.country || "US",
            ownership_percentage: data.ownershipPercentage,
            id_type: data.idType || null,
            id_number: data.idNumber ? encrypt(data.idNumber) : null,
            id_state: data.idState || null,
            id_country: data.idCountry || null,
            id_expiration: data.idExpiration ? new Date(data.idExpiration) : null,
          },
          select: { id: true, transaction_id: true, ownership_percentage: true },
        });

    await logAudit({
      orgId: organization.id,
      userId: user.id,
      transactionId: tx.id,
      action: data.id
        ? "transaction.beneficial_owner.updated"
        : "transaction.beneficial_owner.created",
      details: { owner_id: owner.id, ownership_percentage: owner.ownership_percentage },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    return NextResponse.json({ owner });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save beneficial owner";
    const status =
      message === "Unauthorized" || message === "Organization required" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
