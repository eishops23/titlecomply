import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { BillingClient } from "./billing-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Billing",
};

export default async function BillingSettingsPage() {
  const organization = await prisma.organization.findFirst({
    include: { users: { select: { id: true } } },
  });

  return (
    <SettingsLayout activePage="billing">
      <BillingClient organization={organization} />
    </SettingsLayout>
  );
}
