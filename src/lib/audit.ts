import { createHash } from "node:crypto";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

type AuditDetails = Prisma.InputJsonValue | null;

type LogAuditParams = {
  orgId: string;
  userId?: string | null;
  transactionId?: string | null;
  action: string;
  details?: AuditDetails;
  ipAddress?: string | null;
  userAgent?: string | null;
};

function hashAuditPayload(params: {
  previousHash: string;
  action: string;
  details: AuditDetails;
  createdAtIso: string;
}): string {
  const payload = JSON.stringify({
    previousHash: params.previousHash,
    action: params.action,
    details: params.details ?? null,
    createdAt: params.createdAtIso,
  });
  return createHash("sha256").update(payload).digest("hex");
}

export async function logAudit(params: LogAuditParams): Promise<void> {
  const previous = await prisma.auditLog.findFirst({
    where: { org_id: params.orgId },
    orderBy: { created_at: "desc" },
    select: { current_hash: true },
  });

  const createdAt = new Date();
  const previousHash = previous?.current_hash ?? "GENESIS";
  const currentHash = hashAuditPayload({
    previousHash,
    action: params.action,
    details: params.details ?? null,
    createdAtIso: createdAt.toISOString(),
  });

  await prisma.auditLog.create({
    data: {
      org_id: params.orgId,
      user_id: params.userId ?? null,
      transaction_id: params.transactionId ?? null,
      action: params.action,
      details: params.details ?? undefined,
      ip_address: params.ipAddress ?? null,
      user_agent: params.userAgent ?? null,
      previous_hash: previous?.current_hash ?? null,
      current_hash: currentHash,
      created_at: createdAt,
    },
  });
}
