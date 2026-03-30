import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { PLAN_USER_LIMITS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z
    .enum(["ADMIN", "COMPLIANCE_OFFICER", "CLOSER", "PROCESSOR", "READ_ONLY"])
    .default("CLOSER"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role } = inviteSchema.parse(body);

    const org = await prisma.organization.findFirst({
      include: { users: { select: { id: true } } },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const limit = PLAN_USER_LIMITS[org.plan] ?? 2;
    if (org.users.length >= limit) {
      return NextResponse.json(
        {
          error: `Team member limit reached (${limit} on ${org.plan} plan). Upgrade to add more members.`,
        },
        { status: 403 },
      );
    }

    const existing = await prisma.user.findFirst({
      where: { org_id: org.id, email },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A team member with this email already exists" },
        { status: 409 },
      );
    }

    const user = await prisma.user.create({
      data: {
        org_id: org.id,
        clerk_user_id: `pending_${Date.now()}`,
        email,
        role,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }
    console.error("[team/invite] Error:", error);
    return NextResponse.json({ error: "Invitation failed" }, { status: 500 });
  }
}
