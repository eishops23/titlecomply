import { NextRequest, NextResponse } from "next/server";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> },
) {
  try {
    const { organization } = await resolveUser();
    const { transactionId } = await params;

    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, org_id: organization.id },
      select: { id: true, org_id: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: { transaction_id: transactionId, org_id: organization.id },
      orderBy: { created_at: "desc" },
      include: {
        user: {
          select: { email: true, first_name: true, last_name: true },
        },
      },
    });

    return NextResponse.json({ auditLogs });
  } catch (error) {
    console.error("[audit] Error:", error);
    return NextResponse.json({ error: "Failed to fetch audit trail" }, { status: 500 });
  }
}
