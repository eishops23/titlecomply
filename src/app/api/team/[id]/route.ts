import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getClientIp, getUserAgent, logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, org_id: true, role: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (!user.org_id) {
      return NextResponse.json({ error: "User organization not found" }, { status: 400 });
    }

    if (user.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { org_id: user.org_id, role: "ADMIN" },
      });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot remove the last admin from the organization." },
          { status: 400 },
        );
      }
    }

    await prisma.transaction.updateMany({
      where: { assigned_to_id: id },
      data: { assigned_to_id: null },
    });

    await prisma.user.delete({ where: { id } });

    try {
      await logAudit({
        orgId: user.org_id,
        action: "user.removed",
        details: { email: user.email, role: user.role },
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      });
    } catch (auditError) {
      console.error("[audit] Failed:", auditError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[team/delete] Error:", error);
    return NextResponse.json({ error: "Remove failed" }, { status: 500 });
  }
}
