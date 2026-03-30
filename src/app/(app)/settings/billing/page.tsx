import { prisma } from "@/lib/db";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { BillingClient } from "./billing-client";

export const dynamic = "force-dynamic";

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
