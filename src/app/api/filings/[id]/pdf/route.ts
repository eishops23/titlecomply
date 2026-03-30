import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { FilingData } from "@/lib/filing-generator";

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

    const filing = await prisma.filing.findFirst({
      where: { id: parsed.data.id, org_id: organization.id },
      select: { id: true, pdf_url: true, filing_data: true },
    });
    if (!filing) {
      return NextResponse.json({ error: "Filing not found" }, { status: 404 });
    }
    if (!filing.pdf_url) {
      return NextResponse.json({ error: "PDF not yet generated" }, { status: 404 });
    }

    const filingsDir = process.env.FILINGS_DIR || path.join(process.cwd(), "filings");
    const relativePath = filing.pdf_url.replace("/filings/", "");
    const filePath = path.join(filingsDir, relativePath);

    try {
      const pdfBuffer = await fs.readFile(filePath);
      const data = filing.filing_data as FilingData | null;
      const filename = data?.filing_id ? `${data.filing_id}.pdf` : `filing-${filing.id}.pdf`;

      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": String(pdfBuffer.length),
        },
      });
    } catch {
      return NextResponse.json({ error: "PDF file not found on disk" }, { status: 404 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to serve PDF";
    const status =
      message === "Unauthorized" || message === "Organization required" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
