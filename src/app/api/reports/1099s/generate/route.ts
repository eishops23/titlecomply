import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { build1099SData } from "@/lib/form-1099s";
import { generate1099SPdf } from "@/lib/form-1099s-generator";
import { getClientIp, getUserAgent, logAudit } from "@/lib/audit";
import { getUpgradeMessage, planHasFeature } from "@/lib/plan-gates";

export const dynamic = "force-dynamic";

const schema = z.object({ transactionId: z.string().uuid() });
const DIR = process.env.FILINGS_DIR || path.join(process.cwd(), "filings");

export async function POST(request: NextRequest) {
  try {
    const { user, organization } = await resolveUser();
    const parsed = schema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    if (!planHasFeature(organization.plan, "form1099sReporting")) {
      return NextResponse.json(
        { error: getUpgradeMessage("form1099sReporting", organization.plan) },
        { status: 403 },
      );
    }

    const transaction = await prisma.transaction.findFirst({
      where: { id: parsed.data.transactionId, org_id: organization.id },
    });
    if (!transaction) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    const dc = transaction.data_collection && typeof transaction.data_collection === "object"
      ? (transaction.data_collection as Record<string, unknown>)
      : {};

    const data = build1099SData(
      {
        ...transaction,
        purchase_price: transaction.purchase_price ? Number(transaction.purchase_price) : null,
        data_collection: dc,
      },
      organization,
      process.env.DEFAULT_FILER_EIN || "",
    );
    const pdf = await generate1099SPdf(data);
    const orgDir = path.join(DIR, organization.id, "1099s");
    await fs.mkdir(orgDir, { recursive: true });
    const fileName = `${data.filingId}.pdf`;
    await fs.writeFile(path.join(orgDir, fileName), pdf);

    const existing = Array.isArray(dc.form1099s) ? dc.form1099s : [];
    const filingRecord = {
      id: data.filingId,
      transactionId: transaction.id,
      generatedAt: new Date().toISOString(),
      generatedBy: user.email,
      pdfUrl: `/filings/${organization.id}/1099s/${fileName}`,
      data,
    };
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { data_collection: { ...dc, form1099s: [...existing, filingRecord] } as Prisma.InputJsonObject },
    });

    await logAudit({
      orgId: organization.id,
      userId: user.id,
      action: "1099s.generated",
      transactionId: transaction.id,
      details: { filingId: data.filingId },
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });
    return NextResponse.json({ filing: filingRecord });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate 1099-S";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
