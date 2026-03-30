import type {
  OrganizationJSON,
  OrganizationMembershipJSON,
  UserJSON,
} from "@clerk/backend";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextResponse, type NextRequest } from "next/server";
import { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

function mapClerkRoleToUserRole(clerkRole: string): UserRole {
  if (clerkRole === "org:admin") {
    return UserRole.ADMIN;
  }
  return UserRole.CLOSER;
}

function primaryEmailFromUserJson(u: UserJSON): string {
  const primary = u.email_addresses.find(
    (e) => e.id === u.primary_email_address_id,
  );
  return (
    primary?.email_address ??
    u.email_addresses[0]?.email_address ??
    ""
  );
}

export async function POST(req: NextRequest) {
  const signingSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!signingSecret) {
    return NextResponse.json(
      { error: "CLERK_WEBHOOK_SECRET is not configured" },
      { status: 500 },
    );
  }

  let evt: Awaited<ReturnType<typeof verifyWebhook>>;
  try {
    evt = await verifyWebhook(req, { signingSecret });
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  try {
    switch (evt.type) {
      case "user.created": {
        const data = evt.data as UserJSON;
        const email = primaryEmailFromUserJson(data);
        if (!email) {
          break;
        }
        await prisma.user.upsert({
          where: { clerk_user_id: data.id },
          create: {
            clerk_user_id: data.id,
            email,
            first_name: data.first_name,
            last_name: data.last_name,
          },
          update: {
            email,
            first_name: data.first_name,
            last_name: data.last_name,
          },
        });
        break;
      }
      case "organization.created": {
        const data = evt.data as OrganizationJSON;
        await prisma.organization.upsert({
          where: { clerk_org_id: data.id },
          create: {
            clerk_org_id: data.id,
            name: data.name,
          },
          update: { name: data.name },
        });
        break;
      }
      case "organizationMembership.created": {
        const data = evt.data as OrganizationMembershipJSON;
        const orgJson = data.organization;
        const clerkUserId = data.public_user_data.user_id;

        const organization = await prisma.organization.upsert({
          where: { clerk_org_id: orgJson.id },
          create: {
            clerk_org_id: orgJson.id,
            name: orgJson.name,
          },
          update: { name: orgJson.name },
        });

        const existing = await prisma.user.findUnique({
          where: { clerk_user_id: clerkUserId },
        });

        const identifier = data.public_user_data.identifier;
        const fallbackEmail =
          identifier.includes("@") ? identifier : `${clerkUserId}@placeholder.invalid`;

        await prisma.user.upsert({
          where: { clerk_user_id: clerkUserId },
          create: {
            clerk_user_id: clerkUserId,
            org_id: organization.id,
            email: existing?.email ?? fallbackEmail,
            first_name: data.public_user_data.first_name,
            last_name: data.public_user_data.last_name,
            role: mapClerkRoleToUserRole(data.role),
          },
          update: {
            org_id: organization.id,
            first_name: data.public_user_data.first_name,
            last_name: data.public_user_data.last_name,
            role: mapClerkRoleToUserRole(data.role),
          },
        });
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("[clerk webhook]", e);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
