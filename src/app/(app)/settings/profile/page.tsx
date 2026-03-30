import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { ProfileClient } from "./profile-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfileSettingsPage() {
  const user = await prisma.user.findFirst({
    include: {
      organization: { select: { plan: true } },
    },
  });

  return (
    <SettingsLayout activePage="profile">
      <ProfileClient user={user} />
    </SettingsLayout>
  );
}
