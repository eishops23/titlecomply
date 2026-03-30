import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get("severity");
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};

    if (severity && severity !== "all") {
      where.severity = severity;
    }
    if (type && type !== "all") {
      where.type = type;
    }
    if (status === "active") {
      where.acknowledged = false;
    } else if (status === "acknowledged") {
      where.acknowledged = true;
    }

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        transaction: {
          select: {
            id: true,
            file_number: true,
            property_address: true,
            property_city: true,
            property_state: true,
          },
        },
      },
    });

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("[alerts/list] Error:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}
