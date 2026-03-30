import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({ id: z.string().uuid() });

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { organization } = await resolveUser();
    const parsed = paramsSchema.safeParse(await context.params);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const document = await prisma.document.findFirst({
      where: { id: parsed.data.id, transaction: { org_id: organization.id } },
      include: {
        transaction: {
          select: {
            id: true,
            org_id: true,
            file_number: true,
            property_address: true,
            buyer_type: true,
            entity_detail: true,
            trust_detail: true,
            beneficial_owners: true,
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error("[documents/get] Error:", error);
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { organization } = await resolveUser();
    const parsed = paramsSchema.safeParse(await context.params);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const document = await prisma.document.findFirst({
      where: { id: parsed.data.id, transaction: { org_id: organization.id } },
      select: { id: true, file_url: true },
    });
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    await prisma.document.delete({ where: { id: document.id } });

    if (document.file_url.startsWith("/uploads/")) {
      const relativePath = document.file_url.replace("/uploads/", "");
      const storagePath = path.join(process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads"), relativePath);
      await deleteFile(storagePath);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[documents/delete] Error:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
