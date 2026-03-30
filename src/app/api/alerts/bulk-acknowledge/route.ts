import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const bulkSchema = z.object({
  alertIds: z.array(z.string().uuid()).min(1, "At least one alert ID required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertIds } = bulkSchema.parse(body);

    const result = await prisma.alert.updateMany({
      where: {
        id: { in: alertIds },
        acknowledged: false,
      },
      data: {
        acknowledged: true,
        acknowledged_by: "system",
        acknowledged_at: new Date(),
      },
    });

    return NextResponse.json({
      acknowledged: result.count,
      message: `${result.count} alert(s) acknowledged`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }
    console.error("[alerts/bulk-acknowledge] Error:", error);
    return NextResponse.json({ error: "Bulk acknowledge failed" }, { status: 500 });
  }
}
