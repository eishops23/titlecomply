import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { resolveUser } from "@/lib/auth";
import { canInviteTeamMember } from "@/lib/stripe";
import { getClientIp, getUserAgent, logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z
    .enum(["ADMIN", "COMPLIANCE_OFFICER", "CLOSER", "PROCESSOR", "READ_ONLY"])
    .default("CLOSER"),
});

export async function POST(request: NextRequest) {
  try {
    const { organization } = await resolveUser();
    const body = await request.json();
    const { email, role } = inviteSchema.parse(body);

    const limitCheck = await canInviteTeamMember(organization.id);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: limitCheck.message,
        },
        { status: 403 },
      );
    }

    const existing = await prisma.user.findFirst({
      where: { org_id: organization.id, email },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A team member with this email already exists" },
        { status: 409 },
      );
    }

    const user = await prisma.user.create({
      data: {
        org_id: organization.id,
        clerk_user_id: `pending_${Date.now()}`,
        email,
        role,
      },
    });

    try {
      await logAudit({
        orgId: organization.id,
        action: "user.invited",
        details: { email, role },
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      });
    } catch (auditError) {
      console.error("[audit] Failed:", auditError);
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }
    const message = error instanceof Error ? error.message : "Invitation failed";
    const status =
      message === "Unauthorized" || message === "Organization required" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
