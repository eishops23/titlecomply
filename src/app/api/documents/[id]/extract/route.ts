import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { DocumentType, ExtractionStatus } from "@/generated/prisma/enums";
import { extractFromDocument, extractFromImage } from "@/lib/claude";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { extractTextFromPdf, readFile } from "@/lib/storage";
import { planHasAiExtraction } from "@/lib/stripe";
import { getClientIp, getUserAgent, logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({ id: z.string().uuid() });

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { organization } = await resolveUser();
    const parsedParams = paramsSchema.safeParse(await context.params);
    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsedParams.error.flatten() },
        { status: 400 },
      );
    }

    const { id } = parsedParams.data;
    const document = await prisma.document.findFirst({
      where: { id, transaction: { org_id: organization.id } },
      select: {
        id: true,
        file_url: true,
        file_type: true,
        document_type: true,
        extraction_status: true,
        transaction: {
          select: { id: true, org_id: true },
        },
      },
    });
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (document.extraction_status === ExtractionStatus.PROCESSING) {
      return NextResponse.json({ error: "Extraction already in progress" }, { status: 409 });
    }

    const org = await prisma.organization.findUnique({
      where: { id: document.transaction.org_id },
      select: { plan: true },
    });
    if (org && !planHasAiExtraction(org.plan)) {
      return NextResponse.json(
        {
          error:
            "AI document extraction requires a Professional or Enterprise plan. Upgrade to access this feature.",
        },
        { status: 403 },
      );
    }

    await prisma.document.update({
      where: { id: document.id },
      data: { extraction_status: ExtractionStatus.PROCESSING },
    });

    try {
      const storagePath = document.file_url.startsWith("/uploads/")
        ? path.join(
            process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads"),
            document.file_url.replace("/uploads/", ""),
          )
        : document.file_url;

      const fileBuffer = await readFile(storagePath);
      let extractionResult:
        | Awaited<ReturnType<typeof extractFromDocument>>
        | Awaited<ReturnType<typeof extractFromImage>>;

      if (document.file_type === "pdf") {
        const text = await extractTextFromPdf(fileBuffer);
        if (!text || text.trim().length < 10) {
          throw new Error("Could not extract text from PDF. The document may be scanned.");
        }
        extractionResult = await extractFromDocument(text, document.document_type as DocumentType);
      } else if (["jpg", "jpeg", "png"].includes(document.file_type)) {
        const base64 = fileBuffer.toString("base64");
        const mediaType = document.file_type === "png" ? "image/png" : "image/jpeg";
        extractionResult = await extractFromImage(
          base64,
          mediaType,
          document.document_type as DocumentType,
        );
      } else if (document.file_type === "docx") {
        const skipped = await prisma.document.update({
          where: { id: document.id },
          data: {
            extraction_status: ExtractionStatus.SKIPPED,
            extraction_result: {
              message: "DOCX extraction not yet supported. Please upload PDF or image.",
            },
          },
        });
        return NextResponse.json({ document: skipped });
      } else {
        throw new Error(`Unsupported file type for extraction: ${document.file_type}`);
      }

      const updated = await prisma.document.update({
        where: { id: document.id },
        data: {
          extraction_status: ExtractionStatus.COMPLETED,
          extraction_result: extractionResult as unknown as Prisma.InputJsonValue,
          extraction_confidence: extractionResult.confidence,
          extracted_at: new Date(),
        },
      });

      try {
        await logAudit({
          orgId: document.transaction.org_id,
          action: "document.extracted",
          details: {
            document_id: id,
            extraction_type: extractionResult.type,
            confidence: extractionResult.confidence,
          },
          transactionId: document.transaction.id,
          ipAddress: getClientIp(request),
          userAgent: getUserAgent(request),
        });
      } catch (auditError) {
        console.error("[audit] Failed:", auditError);
      }

      return NextResponse.json({ document: updated });
    } catch (extractError) {
      const errorMessage =
        extractError instanceof Error ? extractError.message : "Unknown extraction error";
      await prisma.document.update({
        where: { id: document.id },
        data: {
          extraction_status: ExtractionStatus.FAILED,
          extraction_result: { error: errorMessage },
        },
      });
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  } catch (error) {
    console.error("[documents/extract] Error:", error);
    return NextResponse.json({ error: "Extraction request failed" }, { status: 500 });
  }
}
