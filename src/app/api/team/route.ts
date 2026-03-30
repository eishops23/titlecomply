import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const org = await prisma.organization.findFirst({ select: { id: true } });
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const users = await prisma.user.findMany({
      where: { org_id: org.id },
      orderBy: { created_at: "asc" },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        created_at: true,
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[team/list] Error:", error);
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}
