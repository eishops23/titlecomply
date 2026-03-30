import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { getClientIp, getUserAgent, logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const patchTransactionSchema = z.object({
  fileNumber: z.string().trim().max(100).optional(),
  seller: z
    .object({
      name: z.string().trim().min(1).optional(),
      address: z.string().trim().min(1).optional(),
      taxId: z.string().trim().optional(),
    })
    .optional(),
  settlementAgent: z
    .object({
      companyName: z.string().trim().optional(),
      agentName: z.string().trim().optional(),
      licenseNumber: z.string().trim().optional(),
      address: z.string().trim().optional(),
      phone: z.string().trim().optional(),
    })
    .optional(),
  collectionProgress: z.number().min(0).max(100).optional(),
});

const paramsSchema = z.object({ id: z.string().uuid() });

function mergeDataCollection(
  currentValue: Prisma.JsonValue | null,
  incoming: {
    seller?: { name?: string; address?: string; taxId?: string };
    settlementAgent?: {
      companyName?: string;
      agentName?: string;
      licenseNumber?: string;
      address?: string;
      phone?: string;
    };
  },
): Prisma.InputJsonValue {
  const current =
    currentValue && typeof currentValue === "object" && !Array.isArray(currentValue)
      ? (currentValue as Record<string, unknown>)
      : {};

  const next: Record<string, unknown> = { ...current };

  if (incoming.seller) {
    const existingSeller =
      next.seller && typeof next.seller === "object" && !Array.isArray(next.seller)
        ? (next.seller as Record<string, unknown>)
        : {};
    next.seller = {
      ...existingSeller,
      ...(incoming.seller.name !== undefined ? { name: incoming.seller.name } : {}),
      ...(incoming.seller.address !== undefined
        ? { address: incoming.seller.address }
        : {}),
      ...(incoming.seller.taxId !== undefined
        ? { taxId: incoming.seller.taxId ? encrypt(incoming.seller.taxId) : "" }
        : {}),
    };
  }

  if (incoming.settlementAgent) {
    const existingAgent =
      next.settlementAgent &&
      typeof next.settlementAgent === "object" &&
      !Array.isArray(next.settlementAgent)
        ? (next.settlementAgent as Record<string, unknown>)
        : {};
    next.settlementAgent = {
      ...existingAgent,
      ...incoming.settlementAgent,
    };
  }

  return next as Prisma.InputJsonObject;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { user, organization } = await resolveUser();
    const { id } = await context.params;

    const body = await request.json();
    const parsed = patchTransactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const existing = await prisma.transaction.findFirst({
      where: { id, org_id: organization.id },
      select: { id: true, data_collection: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const payload = parsed.data;
    const updated = await prisma.transaction.update({
      where: { id: existing.id },
      data: {
        ...(payload.fileNumber !== undefined ? { file_number: payload.fileNumber } : {}),
        ...(payload.collectionProgress !== undefined
          ? { collection_progress: payload.collectionProgress }
          : {}),
        ...(payload.seller || payload.settlementAgent
          ? {
              data_collection: mergeDataCollection(existing.data_collection, {
                seller: payload.seller,
                settlementAgent: payload.settlementAgent,
              }),
            }
          : {}),
      },
      select: { id: true, collection_progress: true },
    });

    try {
      await logAudit({
        orgId: organization.id,
        userId: user.id,
        action: "transaction.updated",
        details: { updated_fields: Object.keys(payload) },
        transactionId: updated.id,
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      });
    } catch (auditError) {
      console.error("[audit] Failed:", auditError);
    }

    return NextResponse.json({ transaction: updated });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update transaction";
    const status =
      message === "Unauthorized" || message === "Organization required" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { organization } = await resolveUser();
    const parsed = paramsSchema.safeParse(await context.params);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const transaction = await prisma.transaction.findFirst({
      where: { id: parsed.data.id, org_id: organization.id },
      include: {
        organization: true,
        beneficial_owners: {
          orderBy: { created_at: "asc" },
        },
        documents: {
          orderBy: { created_at: "desc" },
        },
        filings: {
          orderBy: { created_at: "desc" },
        },
        entity_detail: true,
        trust_detail: true,
        assigned_to: {
          select: { id: true, first_name: true, last_name: true, email: true },
        },
        created_by: {
          select: { id: true, first_name: true, last_name: true, email: true },
        },
      },
    });
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch transaction";
    const status =
      message === "Unauthorized" || message === "Organization required" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { user, organization } = await resolveUser();
    const parsed = paramsSchema.safeParse(await context.params);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const transaction = await prisma.transaction.findFirst({
      where: { id: parsed.data.id, org_id: organization.id },
      select: { id: true, status: true, org_id: true, property_address: true },
    });
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: "ARCHIVED" },
    });

    try {
      await logAudit({
        orgId: transaction.org_id,
        userId: user.id,
        action: "transaction.archived",
        details: { property_address: transaction.property_address },
        transactionId: parsed.data.id,
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      });
    } catch (auditError) {
      console.error("[audit] Failed:", auditError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to archive transaction";
    const status =
      message === "Unauthorized" || message === "Organization required" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
