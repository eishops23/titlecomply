import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type FilingWithTransaction = {
  id: string;
  filing_data: unknown;
  transaction: {
    property_address: string;
  } | null;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (status && status !== "all") {
      where.status = status;
    }

    const filings = await prisma.filing.findMany({
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
            property_zip: true,
          },
        },
      },
    });

    let filtered = filings;
    if (search) {
      const q = search.toLowerCase();
      filtered = filings.filter((filing) => {
        const current = filing as unknown as FilingWithTransaction;
        const filingData = current.filing_data as { filing_id?: string } | null;
        const filingId = (filingData?.filing_id || current.id).toLowerCase();
        const address = (current.transaction?.property_address || "").toLowerCase();
        return filingId.includes(q) || address.includes(q);
      });
    }

    return NextResponse.json({ filings: filtered });
  } catch (error) {
    console.error("[filings/list] Error:", error);
    return NextResponse.json({ error: "Failed to fetch filings" }, { status: 500 });
  }
}
