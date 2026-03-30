import { prisma } from "@/lib/db";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { ProfileClient } from "./profile-client";

export const dynamic = "force-dynamic";

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
