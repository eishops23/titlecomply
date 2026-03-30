import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TransactionStatus } from "@/generated/prisma/enums";
import { resolveUser } from "@/lib/auth";
import { getClientIp, getUserAgent, logAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const VALID_TRANSITIONS: Record<string, string[]> = {
  SCREENING: ["REQUIRES_FILING", "NO_FILING_REQUIRED"],
  REQUIRES_FILING: ["COLLECTING"],
  COLLECTING: ["VALIDATING", "ARCHIVED"],
  VALIDATING: ["READY_TO_FILE", "COLLECTING"],
  READY_TO_FILE: ["FILED", "VALIDATING"],
  FILED: ["ACCEPTED", "REJECTED"],
  REJECTED: ["READY_TO_FILE", "ARCHIVED"],
  ACCEPTED: ["ARCHIVED"],
  NO_FILING_REQUIRED: ["ARCHIVED", "COLLECTING"],
  ARCHIVED: [],
};

const statusSchema = z.object({
  status: z.enum([
    "SCREENING",
    "REQUIRES_FILING",
    "NO_FILING_REQUIRED",
    "COLLECTING",
    "VALIDATING",
    "READY_TO_FILE",
    "FILED",
    "ACCEPTED",
    "REJECTED",
    "ARCHIVED",
  ]),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, organization } = await resolveUser();
    const { id } = await params;
    const body = await request.json();
    const { status: newStatus } = statusSchema.parse(body);

    const transaction = await prisma.transaction.findFirst({
      where: { id, org_id: organization.id },
      select: { id: true, org_id: true, status: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const allowed = VALID_TRANSITIONS[transaction.status] ?? [];
    if (!allowed.includes(newStatus)) {
      return NextResponse.json(
        { error: `Cannot transition from ${transaction.status} to ${newStatus}. Allowed: ${allowed.join(", ")}` },
        { status: 400 },
      );
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: { status: newStatus as TransactionStatus },
    });

    try {
      await logAudit({
        orgId: transaction.org_id,
        userId: user.id,
        action: "transaction.status_changed",
        details: { from: transaction.status, to: newStatus },
        transactionId: id,
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      });
    } catch (auditError) {
      console.error("[audit] Failed:", auditError);
    }

    return NextResponse.json({ transaction: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid status", details: error.flatten() }, { status: 400 });
    }
    console.error("[status] Error:", error);
    return NextResponse.json({ error: "Status update failed" }, { status: 500 });
  }
}
