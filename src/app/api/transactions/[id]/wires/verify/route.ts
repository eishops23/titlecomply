import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { verifyWireInstructions, type WireInstruction } from "@/lib/wire-fraud";

export const dynamic = "force-dynamic";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { organization } = await resolveUser();
    const { id } = await context.params;
    const transaction = await prisma.transaction.findFirst({
      where: { id, org_id: organization.id },
      select: { id: true, data_collection: true, closing_date: true },
    });
    if (!transaction) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    const data = transaction.data_collection && typeof transaction.data_collection === "object"
      ? (transaction.data_collection as Record<string, unknown>)
      : {};
    const wires = Array.isArray(data.wires) ? ([...data.wires] as WireInstruction[]) : [];
    if (wires.length === 0) return NextResponse.json({ error: "No wire instructions found" }, { status: 400 });

    const idx = wires.length - 1;
    const current = wires[idx];
    const previous = idx > 0 ? wires[idx - 1] : null;
    const flags = verifyWireInstructions(
      {
        bankName: current.bankName,
        routingNumber: current.routingNumber,
        accountNumber: decrypt(current.accountNumber),
        amount: current.amount,
        submittedAt: current.submittedAt,
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
    wires[idx] = {
      ...current,
      flags,
      verificationStatus: flags.length ? "flagged" : "verified",
    };
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { data_collection: ({ ...data, wires } as unknown) as Prisma.InputJsonObject },
    });
    return NextResponse.json({ wire: wires[idx] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to verify wire";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
