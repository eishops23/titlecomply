import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { SettingsClient } from "./settings-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const organization = await prisma.organization.findFirst();
  return (
    <SettingsLayout activePage="organization">
      <SettingsClient organization={organization} />
    </SettingsLayout>
  );
}
