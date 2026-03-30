import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getClientIp, getUserAgent, logAudit } from "@/lib/audit";
import { getRequiredConfirmations, type WireInstruction } from "@/lib/wire-fraud";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  method: z.enum(["in_app", "phone_callback", "in_person"]),
  notes: z.string().max(500).optional(),
});

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
      select: { id: true, data_collection: true },
    });
    if (!transaction) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    const data = transaction.data_collection && typeof transaction.data_collection === "object"
      ? (transaction.data_collection as Record<string, unknown>)
      : {};
    const wires = Array.isArray(data.wires) ? ([...data.wires] as WireInstruction[]) : [];
    if (wires.length === 0) return NextResponse.json({ error: "No wire instructions found" }, { status: 400 });

    const i = wires.length - 1;
    const current = wires[i];
    current.confirmations = [
      ...current.confirmations,
      {
        userId: user.id,
        userName: [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email,
        method: parsed.data.method,
        notes: parsed.data.notes,
        confirmedAt: new Date().toISOString(),
      },
    ];
    const required = getRequiredConfirmations(current.flags);
    if (current.confirmations.length >= required.count) {
      current.verificationStatus = "confirmed";
    }
    wires[i] = current;

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { data_collection: ({ ...data, wires } as unknown) as Prisma.InputJsonObject },
    });

    await logAudit({
      orgId: organization.id,
      userId: user.id,
      action: "wire.confirmed",
      transactionId: transaction.id,
      details: { wireId: current.id, method: parsed.data.method, confirmations: current.confirmations.length },
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });
    return NextResponse.json({ wire: current, required });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to confirm wire";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
