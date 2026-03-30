import { NextResponse, type NextRequest } from "next/server";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requires1099S } from "@/lib/form-1099s";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { organization } = await resolveUser();
    const yearParam = request.nextUrl.searchParams.get("year");
    const year = Number(yearParam || new Date().getFullYear());
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 1));

    const transactions = await prisma.transaction.findMany({
      where: {
        org_id: organization.id,
        closing_date: { gte: start, lt: end },
      },
      orderBy: { closing_date: "desc" },
    });

    const rows = transactions.map((t) => {
      const eligibility = requires1099S({
        purchase_price: t.purchase_price ? Number(t.purchase_price) : null,
        status: t.status,
        closing_date: t.closing_date,
      });
      const dc = t.data_collection && typeof t.data_collection === "object" ? (t.data_collection as Record<string, unknown>) : {};
      const filings = Array.isArray(dc.form1099s) ? dc.form1099s : [];
      return {
        transactionId: t.id,
        property: `${t.property_address}, ${t.property_city}, ${t.property_state} ${t.property_zip}`,
        seller: String((dc.seller as Record<string, unknown> | undefined)?.name ?? dc.seller_name ?? ""),
        closingDate: t.closing_date,
        grossProceeds: Number(t.purchase_price || 0),
        required: eligibility.required,
        reason: eligibility.reason,
        generated: filings.length > 0,
      };
    });

    return NextResponse.json({ rows, year });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load 1099-S report";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
