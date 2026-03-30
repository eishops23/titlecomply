import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const roleSchema = z.object({
  role: z.enum(["ADMIN", "COMPLIANCE_OFFICER", "CLOSER", "PROCESSOR", "READ_ONLY"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { role } = roleSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, org_id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === "ADMIN" && role !== "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { org_id: user.org_id, role: "ADMIN" },
      });
      if (adminCount <= 1) {
        return NextResponse.json(
          {
            error:
              "Cannot change role of the last admin. Promote another user to admin first.",
          },
          { status: 400 },
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid role", details: error.issues },
        { status: 400 },
      );
    }
    console.error("[team/role] Error:", error);
    return NextResponse.json({ error: "Role update failed" }, { status: 500 });
  }
}
