import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const leadSchema = z.object({
  email: z.string().email(),
  source: z.string().default("checklist"),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source, name } = leadSchema.parse(body);

    console.log(`[lead] Captured: ${email} (source: ${source})`);

    try {
      const { prisma } = await import("@/lib/db");
      const org = await prisma.organization.findFirst({ select: { id: true } });
      if (org) {
        await prisma.auditLog.create({
          data: {
            org_id: org.id,
            action: "lead.captured",
            details: {
              email,
              source,
              name: name ?? null,
              captured_at: new Date().toISOString(),
            },
            current_hash: `lead-${Date.now()}`,
          },
        });
      }
    } catch {
      // Ignore DB persistence failures for lead capture MVP.
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid email", details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Failed to capture lead" }, { status: 500 });
  }
}
