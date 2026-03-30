import * as crypto from "crypto";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

export interface AuditLogInput {
  orgId: string;
  userId?: string | null;
  action: string;
  details?: Prisma.InputJsonObject;
  transactionId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export type AuditAction =
  | "transaction.created"
  | "transaction.updated"
  | "transaction.screened"
  | "transaction.status_changed"
  | "transaction.archived"
  | "document.uploaded"
  | "document.extracted"
  | "document.data_applied"
  | "document.deleted"
  | "filing.generated"
  | "filing.downloaded"
  | "filing.status_changed"
  | "user.invited"
  | "user.role_changed"
  | "user.removed"
  | "settings.updated"
  | "alert.acknowledged"
  | "system.fincen_monitor";

function computeHash(
  previousHash: string | null,
  action: string,
  details: Prisma.JsonObject | null,
  timestamp: string,
): string {
  const payload = `${previousHash || ""}${action}${JSON.stringify(details || {})}${timestamp}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export async function logAudit(input: AuditLogInput): Promise<string> {
  const {
    orgId,
    userId = null,
    action,
    details = {},
    transactionId = null,
    ipAddress = null,
    userAgent = null,
  } = input;

  const timestamp = new Date().toISOString();

  const previousEntry = await prisma.auditLog.findFirst({
    where: { org_id: orgId },
    orderBy: { created_at: "desc" },
    select: { current_hash: true },
  });

  const previousHash = previousEntry?.current_hash || null;
  const currentHash = computeHash(
    previousHash,
    action,
    details as unknown as Prisma.JsonObject,
    timestamp,
  );

  const entry = await prisma.auditLog.create({
    data: {
      org_id: orgId,
      user_id: userId,
      transaction_id: transactionId,
      action,
      details: details as Prisma.InputJsonObject,
      ip_address: ipAddress,
      user_agent: userAgent,
      previous_hash: previousHash,
      current_hash: currentHash,
    },
  });

  return entry.id;
}

export interface ChainVerificationResult {
  valid: boolean;
  totalEntries: number;
  verifiedEntries: number;
  brokenAt?: {
    entryId: string;
    index: number;
    expectedHash: string;
    actualHash: string;
    action: string;
    createdAt: string;
  };
}

export async function verifyChain(
  transactionId: string,
): Promise<ChainVerificationResult> {
  const entries = await prisma.auditLog.findMany({
    where: { transaction_id: transactionId },
    orderBy: { created_at: "asc" },
    select: {
      id: true,
      action: true,
      details: true,
      previous_hash: true,
      current_hash: true,
      created_at: true,
    },
  });

  if (entries.length === 0) {
    return { valid: true, totalEntries: 0, verifiedEntries: 0 };
  }

  let previousHash: string | null = null;

  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    const expectedHash = computeHash(
      previousHash,
      entry.action,
      (entry.details as Prisma.JsonObject | null) ?? null,
      entry.created_at.toISOString(),
    );

    if (expectedHash !== entry.current_hash) {
      return {
        valid: false,
        totalEntries: entries.length,
        verifiedEntries: i,
        brokenAt: {
          entryId: entry.id,
          index: i,
          expectedHash,
          actualHash: entry.current_hash,
          action: entry.action,
          createdAt: entry.created_at.toISOString(),
        },
      };
    }

    previousHash = entry.current_hash;
  }

  return {
    valid: true,
    totalEntries: entries.length,
    verifiedEntries: entries.length,
  };
}

export async function verifyOrgChain(orgId: string): Promise<ChainVerificationResult> {
  const entries = await prisma.auditLog.findMany({
    where: { org_id: orgId },
    orderBy: { created_at: "asc" },
    select: {
      id: true,
      action: true,
      details: true,
      previous_hash: true,
      current_hash: true,
      created_at: true,
    },
  });

  if (entries.length === 0) {
    return { valid: true, totalEntries: 0, verifiedEntries: 0 };
  }

  let previousHash: string | null = null;

  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    const expectedHash = computeHash(
      previousHash,
      entry.action,
      (entry.details as Prisma.JsonObject | null) ?? null,
      entry.created_at.toISOString(),
    );

    if (expectedHash !== entry.current_hash) {
      return {
        valid: false,
        totalEntries: entries.length,
        verifiedEntries: i,
        brokenAt: {
          entryId: entry.id,
          index: i,
          expectedHash,
          actualHash: entry.current_hash,
          action: entry.action,
          createdAt: entry.created_at.toISOString(),
        },
      };
    }

    previousHash = entry.current_hash;
  }

  return { valid: true, totalEntries: entries.length, verifiedEntries: entries.length };
}

export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return null;
}

export function getUserAgent(request: Request): string | null {
  return request.headers.get("user-agent") || null;
}
