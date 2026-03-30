import { prisma } from "@/lib/db";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { SettingsClient } from "./settings-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const organization = await prisma.organization.findFirst();
  return (
    <SettingsLayout activePage="organization">
      <SettingsClient organization={organization} />
    </SettingsLayout>
  );
}
