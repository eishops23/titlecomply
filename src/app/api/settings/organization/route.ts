import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const orgSettingsSchema = z.object({
  company_name: z.string().min(1).optional(),
  company_email: z.string().email().or(z.literal("")).optional(),
  company_phone: z.string().optional(),
  company_address: z.string().optional(),
  company_city: z.string().optional(),
  company_state: z.string().optional(),
  company_zip: z.string().optional(),
  license_number: z.string().optional(),
  underwriter: z.string().optional(),
  default_reminder_days: z.coerce.number().int().min(1).max(30).optional(),
  auto_screen: z.boolean().optional(),
});

export async function GET() {
  try {
    const org = await prisma.organization.findFirst();

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json({ organization: org });
  } catch (error) {
    console.error("[settings/org/get] Error:", error);
    return NextResponse.json({ error: "Failed to fetch organization" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = orgSettingsSchema.parse(body);

    const org = await prisma.organization.findFirst();
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const updated = await prisma.organization.update({
      where: { id: org.id },
      data: validated,
    });

    return NextResponse.json({ organization: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }
    console.error("[settings/org/patch] Error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
