import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { DocumentType, ExtractionStatus } from "@/generated/prisma/enums";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { storeFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

const uploadSchema = z.object({
  transactionId: z.string().uuid(),
  documentType: z.nativeEnum(DocumentType),
});

export async function POST(request: NextRequest) {
  try {
    const { user, organization } = await resolveUser();

    const formData = await request.formData();
    const file = formData.get("file");
    const transactionId = formData.get("transactionId");
    const documentType = formData.get("documentType");

    if (!(file instanceof File) || typeof transactionId !== "string" || typeof documentType !== "string") {
      return NextResponse.json(
        { error: "Missing required fields: file, transactionId, documentType" },
        { status: 400 },
      );
    }

    const validated = uploadSchema.safeParse({ transactionId, documentType });
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: validated.error.flatten() },
        { status: 400 },
      );
    }

    const transaction = await prisma.transaction.findFirst({
      where: { id: validated.data.transactionId, org_id: organization.id },
      select: { id: true },
    });
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stored = await storeFile(buffer, file.name, validated.data.transactionId);

    const document = await prisma.document.create({
      data: {
        transaction_id: validated.data.transactionId,
        file_name: stored.fileName,
        file_type: stored.fileType,
        file_size: stored.fileSize,
        file_url: stored.fileUrl,
        document_type: validated.data.documentType,
        extraction_status: ExtractionStatus.PENDING,
        uploaded_by: user.id,
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("[documents/upload] Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
