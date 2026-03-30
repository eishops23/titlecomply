import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requires1099S } from "@/lib/form-1099s";
import { planHasFeature } from "@/lib/plan-gates";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { Reports1099SClient } from "./reports-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "1099-S Reporting",
};

export default async function Reports1099SPage() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) redirect("/sign-in");
  const { organization } = await resolveUser();
  if (!planHasFeature(organization.plan, "form1099sReporting")) {
    return (
      <div className="p-6">
        <UpgradePrompt
          feature="1099-S Reporting"
          requiredPlan="PROFESSIONAL"
          currentPlan={organization.plan}
        />
      </div>
    );
  }
  const year = new Date().getFullYear();
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));

  const transactions = await prisma.transaction.findMany({
    where: { org_id: organization.id, closing_date: { gte: start, lt: end } },
    orderBy: { closing_date: "desc" },
  });

  const rows = transactions.map((t) => {
    const requiredRes = requires1099S({
      purchase_price: t.purchase_price ? Number(t.purchase_price) : null,
      status: t.status,
      closing_date: t.closing_date,
    });
    const dc = t.data_collection && typeof t.data_collection === "object" ? (t.data_collection as Record<string, unknown>) : {};
    const generated = Array.isArray(dc.form1099s) && dc.form1099s.length > 0;
    return {
      transactionId: t.id,
      property: `${t.property_address}, ${t.property_city}, ${t.property_state} ${t.property_zip}`,
      seller: String((dc.seller as Record<string, unknown> | undefined)?.name ?? dc.seller_name ?? ""),
      closingDate: t.closing_date,
      grossProceeds: Number(t.purchase_price || 0),
      required: requiredRes.required,
      reason: requiredRes.reason,
      generated,
    };
  });

  return <Reports1099SClient initialRows={rows} initialYear={year} canGenerate />;
}
