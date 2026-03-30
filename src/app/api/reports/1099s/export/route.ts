import { NextResponse, type NextRequest } from "next/server";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  try {
    const { organization } = await resolveUser();
    const year = Number(request.nextUrl.searchParams.get("year") || new Date().getFullYear());
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 1));
    const transactions = await prisma.transaction.findMany({
      where: { org_id: organization.id, closing_date: { gte: start, lt: end } },
    });

    const header = ["FILING_ID", "TRANSACTION_ID", "SELLER", "PROPERTY_ADDRESS", "CLOSING_DATE", "GROSS_PROCEEDS"];
    const rows = [header.join(",")];

    for (const t of transactions) {
      const dc = t.data_collection && typeof t.data_collection === "object" ? (t.data_collection as Record<string, unknown>) : {};
      const filings = Array.isArray(dc.form1099s) ? dc.form1099s : [];
      if (filings.length === 0) continue;
      const latest = filings[filings.length - 1] as Record<string, unknown>;
      const seller = String((dc.seller as Record<string, unknown> | undefined)?.name ?? dc.seller_name ?? "");
      rows.push(
        [
          csvEscape(String(latest.id ?? "")),
          csvEscape(t.id),
          csvEscape(seller),
          csvEscape(`${t.property_address}, ${t.property_city}, ${t.property_state} ${t.property_zip}`),
          csvEscape(t.closing_date ? t.closing_date.toISOString().slice(0, 10) : ""),
          csvEscape(String(Number(t.purchase_price || 0))),
        ].join(","),
      );
    }

    const csv = rows.join("\n");
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="1099s-${year}.csv"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to export 1099-S";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
