import crypto from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { AlertSeverity, AlertType } from "@/generated/prisma/enums";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";
import { getClientIp, getUserAgent, logAudit } from "@/lib/audit";
import { verifyWireInstructions, type WireInstruction } from "@/lib/wire-fraud";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  partyRole: z.enum(["buyer", "seller", "lender", "settlement_agent"]),
  bankName: z.string().trim().min(2),
  routingNumber: z.string().regex(/^\d{9}$/),
  accountNumber: z.string().trim().min(4),
  accountName: z.string().trim().min(2),
  bankAddress: z.string().trim().min(4),
  swiftCode: z.string().trim().optional(),
  reference: z.string().trim().default(""),
  amount: z.number().positive(),
});

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { organization } = await resolveUser();
  const { id } = await context.params;
  const transaction = await prisma.transaction.findFirst({
    where: { id, org_id: organization.id },
    select: { data_collection: true },
  });
  if (!transaction) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  const data = transaction.data_collection && typeof transaction.data_collection === "object"
    ? (transaction.data_collection as Record<string, unknown>)
    : {};
  return NextResponse.json({ wires: data.wires ?? [] });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { user, organization } = await resolveUser();
    const { id } = await context.params;
    const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
    }
    const transaction = await prisma.transaction.findFirst({
      where: { id, org_id: organization.id },
      select: { id: true, data_collection: true, closing_date: true },
    });
    if (!transaction) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

    const data = transaction.data_collection && typeof transaction.data_collection === "object"
      ? (transaction.data_collection as Record<string, unknown>)
      : {};
    const existing = Array.isArray(data.wires) ? (data.wires as WireInstruction[]) : [];
    const previous = existing[existing.length - 1];
    const flags = verifyWireInstructions(
      {
        bankName: parsed.data.bankName,
        routingNumber: parsed.data.routingNumber,
        accountNumber: parsed.data.accountNumber,
        amount: parsed.data.amount,
        submittedAt: new Date().toISOString(),
      },
      previous
        ? {
            bankName: previous.bankName,
            routingNumber: previous.routingNumber,
            accountNumber: decrypt(previous.accountNumber),
            amount: previous.amount,
          }
        : null,
      transaction.closing_date,
    );

    const wire: WireInstruction = {
      id: crypto.randomUUID(),
      transactionId: transaction.id,
      partyRole: parsed.data.partyRole,
      bankName: parsed.data.bankName,
      routingNumber: parsed.data.routingNumber,
      accountNumber: encrypt(parsed.data.accountNumber),
      accountName: parsed.data.accountName,
      bankAddress: parsed.data.bankAddress,
      swiftCode: parsed.data.swiftCode,
      reference: parsed.data.reference,
      amount: parsed.data.amount,
      submittedBy: user.email,
      submittedAt: new Date().toISOString(),
      verificationStatus: flags.length ? "flagged" : "verified",
      flags,
      confirmations: [],
    };
    const nextWires = [...existing, wire];

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { data_collection: ({ ...data, wires: nextWires } as unknown) as Prisma.InputJsonObject },
    });

    if (flags.some((f) => f.severity === "critical")) {
      await prisma.alert.create({
        data: {
          org_id: organization.id,
          transaction_id: transaction.id,
          type: AlertType.MISSING_DATA,
          severity: AlertSeverity.CRITICAL,
          title: "Wire fraud risk detected",
          message: "Critical wire-instruction change detected. Confirm by known phone number.",
        },
      });
    }

    await logAudit({
      orgId: organization.id,
      userId: user.id,
      action: "wire.submitted",
      transactionId: transaction.id,
      details: { wireId: wire.id, flagCount: wire.flags.length },
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });
    return NextResponse.json({ wire });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit wire instructions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
