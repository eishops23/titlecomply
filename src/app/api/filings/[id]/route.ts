import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const filing = await prisma.filing.findUnique({
      where: { id },
      include: {
        transaction: {
          select: {
            id: true,
            file_number: true,
            property_address: true,
            property_city: true,
            property_state: true,
            property_zip: true,
            status: true,
          },
        },
      },
    });

    if (!filing) {
      return NextResponse.json({ error: "Filing not found" }, { status: 404 });
    }

    return NextResponse.json({ filing });
  } catch (error) {
    console.error("[filings/detail] Error:", error);
    return NextResponse.json({ error: "Failed to fetch filing" }, { status: 500 });
  }
}
