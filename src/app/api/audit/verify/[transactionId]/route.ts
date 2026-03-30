import { NextRequest, NextResponse } from "next/server";
import { verifyChain } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> },
) {
  try {
    const { transactionId } = await params;
    const result = await verifyChain(transactionId);

    return NextResponse.json({
      verification: result,
      message: result.valid
        ? `Hash chain verified: ${result.verifiedEntries} entries intact.`
        : `Chain integrity broken at entry ${result.brokenAt?.index}: ${result.brokenAt?.action}`,
    });
  } catch (error) {
    console.error("[audit/verify] Error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
