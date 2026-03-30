import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requires1099S } from "@/lib/form-1099s";
import { getUpgradeMessage, planHasFeature } from "@/lib/plan-gates";

export const dynamic = "force-dynamic";

const schema = z.object({ year: z.number().int().min(2020).max(2100) });

export async function POST(request: NextRequest) {
  try {
    const { organization } = await resolveUser();
    if (!planHasFeature(organization.plan, "form1099sReporting")) {
      return NextResponse.json(
        { error: getUpgradeMessage("form1099sReporting", organization.plan) },
        { status: 403 },
      );
    }
    const parsed = schema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    const year = parsed.data.year;
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 1));

    const transactions = await prisma.transaction.findMany({
      where: {
        org_id: organization.id,
        closing_date: { gte: start, lt: end },
      },
    });
    const pending = transactions.filter((t) => {
      const eligible = requires1099S({
        purchase_price: t.purchase_price ? Number(t.purchase_price) : null,
        status: t.status,
        closing_date: t.closing_date,
      }).required;
      const dc = t.data_collection && typeof t.data_collection === "object" ? (t.data_collection as Record<string, unknown>) : {};
      const generated = Array.isArray(dc.form1099s) && dc.form1099s.length > 0;
      return eligible && !generated;
    });
    return NextResponse.json({ year, pendingCount: pending.length, transactionIds: pending.map((t) => t.id) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to prepare batch";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
