import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { TeamClient } from "./team-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Team",
};

export default async function TeamSettingsPage() {
  const organization = await prisma.organization.findFirst({
    include: { users: { orderBy: { created_at: "asc" } } },
  });

  return (
    <SettingsLayout activePage="team">
      <TeamClient organization={organization} />
    </SettingsLayout>
  );
}
