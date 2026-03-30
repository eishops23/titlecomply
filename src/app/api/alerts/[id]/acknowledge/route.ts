import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getClientIp, getUserAgent, logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const alert = await prisma.alert.findUnique({
      where: { id },
      select: { id: true, org_id: true, type: true, acknowledged: true },
    });

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    if (alert.acknowledged) {
      return NextResponse.json(
        { error: "Alert already acknowledged" },
        { status: 400 },
      );
    }

    const updated = await prisma.alert.update({
      where: { id },
      data: {
        acknowledged: true,
        acknowledged_by: "system",
        acknowledged_at: new Date(),
      },
    });

    try {
      await logAudit({
        orgId: alert.org_id,
        action: "alert.acknowledged",
        details: { alert_id: id, alert_type: alert.type },
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      });
    } catch (auditError) {
      console.error("[audit] Failed:", auditError);
    }

    return NextResponse.json({ alert: updated });
  } catch (error) {
    console.error("[alerts/acknowledge] Error:", error);
    return NextResponse.json({ error: "Acknowledge failed" }, { status: 500 });
  }
}
