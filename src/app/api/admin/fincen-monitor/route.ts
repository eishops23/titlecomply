import { NextResponse } from "next/server";
import { checkForFinCENUpdates, getLastMonitorCheck } from "@/lib/fincen-monitor";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await getLastMonitorCheck();
    return NextResponse.json(status);
  } catch (error) {
    console.error("[fincen-monitor/status] Error:", error);
    return NextResponse.json({ error: "Failed to get monitor status" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await checkForFinCENUpdates();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[fincen-monitor/check] Error:", error);
    return NextResponse.json({ error: "Monitor check failed" }, { status: 500 });
  }
}
