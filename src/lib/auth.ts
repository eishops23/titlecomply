import { auth, clerkClient } from "@clerk/nextjs/server";
import type { Organization, User } from "@/generated/prisma/client";
import { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

function mapClerkRoleToUserRole(clerkRole: string): UserRole {
  if (clerkRole === "org:admin") {
    return UserRole.ADMIN;
  }
  return UserRole.CLOSER;
}

export async function resolveUser(): Promise<{
  user: User;
  organization: Organization;
}> {
  const { userId, orgId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  if (!orgId) {
    throw new Error("Organization required");
  }

  const client = await clerkClient();
  const clerkOrg = await client.organizations.getOrganization({
    organizationId: orgId,
  });
  const clerkUser = await client.users.getUser(userId);

  const primaryEmail =
    clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? "";

  if (!primaryEmail) {
    throw new Error("User email is required");
  }

  const { data: memberships } =
    await client.organizations.getOrganizationMembershipList({
      organizationId: orgId,
      userId: [userId],
    });
  const membership = memberships[0];
  const membershipRole = String(membership?.role ?? "org:member");

  let organization = await prisma.organization.findUnique({
    where: { clerk_org_id: orgId },
  });

  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        clerk_org_id: clerkOrg.id,
        name: clerkOrg.name,
      },
    });
  }

  let user = await prisma.user.findUnique({
    where: { clerk_user_id: userId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerk_user_id: userId,
        org_id: organization.id,
        email: primaryEmail,
        first_name: clerkUser.firstName,
        last_name: clerkUser.lastName,
        role: mapClerkRoleToUserRole(membershipRole),
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        org_id: organization.id,
        email: primaryEmail,
        first_name: clerkUser.firstName,
        last_name: clerkUser.lastName,
        role: mapClerkRoleToUserRole(membershipRole),
      },
    });
  }

  return { user, organization };
}
