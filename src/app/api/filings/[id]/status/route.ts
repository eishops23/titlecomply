import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const VALID_FILING_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["VALIDATED"],
  VALIDATED: ["GENERATED", "DRAFT"],
  GENERATED: ["FILED", "VALIDATED"],
  FILED: ["ACCEPTED", "REJECTED"],
  REJECTED: ["AMENDED", "GENERATED"],
  ACCEPTED: [],
  AMENDED: ["GENERATED"],
};

const statusSchema = z.object({
  status: z.enum([
    "DRAFT",
    "VALIDATED",
    "GENERATED",
    "FILED",
    "ACCEPTED",
    "REJECTED",
    "AMENDED",
  ]),
  confirmation_number: z.string().optional(),
  rejection_reason: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status: newStatus, confirmation_number, rejection_reason } =
      statusSchema.parse(body);

    const filing = await prisma.filing.findUnique({
      where: { id },
      select: { id: true, org_id: true, status: true, transaction_id: true },
    });

    if (!filing) {
      return NextResponse.json({ error: "Filing not found" }, { status: 404 });
    }

    const allowed = VALID_FILING_TRANSITIONS[filing.status] || [];
    if (!allowed.includes(newStatus)) {
      return NextResponse.json(
        {
          error: `Cannot transition from ${filing.status} to ${newStatus}. Allowed: ${allowed.join(", ") || "none"}`,
        },
        { status: 400 },
      );
    }

    const updateData: Record<string, unknown> = { status: newStatus };

    if (newStatus === "FILED") {
      updateData.filed_at = new Date();
      if (confirmation_number) updateData.confirmation_number = confirmation_number;
    }
    if (newStatus === "REJECTED" && rejection_reason) {
      updateData.rejection_reason = rejection_reason;
    }
    if (newStatus === "ACCEPTED") {
      await prisma.transaction.update({
        where: { id: filing.transaction_id },
        data: { status: "ACCEPTED" },
      });
    }
    if (newStatus === "REJECTED") {
      await prisma.transaction.update({
        where: { id: filing.transaction_id },
        data: { status: "REJECTED" },
      });
    }

    const updated = await prisma.filing.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ filing: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid status", details: error.issues },
        { status: 400 },
      );
    }
    console.error("[filings/status] Error:", error);
    return NextResponse.json({ error: "Status update failed" }, { status: 500 });
  }
}
