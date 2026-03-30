import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { FilingStatus, TransactionStatus } from "@/generated/prisma/enums";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildFilingData, generateFilingPdf } from "@/lib/filing-generator";
import { validateTransaction, type ValidatableTransaction } from "@/lib/validation";
import { getClientIp, getUserAgent, logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({ id: z.string().uuid() });
const bodySchema = z
  .object({
    filingType: z.enum(["initial", "corrected", "amended"]).optional(),
  })
  .optional();

const FILINGS_DIR = process.env.FILINGS_DIR || path.join(process.cwd(), "filings");

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { user, organization } = await resolveUser();
    const parsedParams = paramsSchema.safeParse(await context.params);
    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsedParams.error.flatten() },
        { status: 400 },
      );
    }

    const rawBody = await request.json().catch(() => ({}));
    const parsedBody = bodySchema.safeParse(rawBody);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsedBody.error.flatten() },
        { status: 400 },
      );
    }

    const transaction = await prisma.transaction.findFirst({
      where: { id: parsedParams.data.id, org_id: organization.id },
      include: {
        entity_detail: true,
        trust_detail: true,
        beneficial_owners: true,
        organization: true,
        filings: {
          orderBy: { created_at: "desc" },
          take: 1,
        },
      },
    });
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const validatable: ValidatableTransaction = {
      id: transaction.id,
      property_address: transaction.property_address,
      property_city: transaction.property_city,
      property_county: transaction.property_county,
      property_state: transaction.property_state,
      property_zip: transaction.property_zip,
      purchase_price: transaction.purchase_price ? Number(transaction.purchase_price) : null,
      closing_date: transaction.closing_date,
      buyer_type: transaction.buyer_type,
      financing_status: transaction.financing_status,
      screening_result: transaction.screening_result,
      data_collection:
        transaction.data_collection && typeof transaction.data_collection === "object"
          ? (transaction.data_collection as Record<string, unknown>)
          : null,
      entity_detail: transaction.entity_detail,
      trust_detail: transaction.trust_detail,
      beneficial_owners: transaction.beneficial_owners,
      organization: transaction.organization,
    };

    const validation = validateTransaction(validatable);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Validation failed - resolve all errors before generating filing", validation },
        { status: 400 },
      );
    }

    const filingId = `TC-${new Date().getFullYear()}-${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;
    const filingType = parsedBody.data?.filingType ?? "initial";
    const generatedBy = user.email;

    const filingData = buildFilingData(
      {
        ...transaction,
        purchase_price: transaction.purchase_price ? Number(transaction.purchase_price) : null,
        data_collection:
          transaction.data_collection && typeof transaction.data_collection === "object"
            ? (transaction.data_collection as Record<string, unknown>)
            : null,
      },
      filingId,
      generatedBy,
      filingType,
    );

    const pdfBuffer = await generateFilingPdf(filingData);
    const filingsDir = path.join(FILINGS_DIR, transaction.org_id);
    await fs.mkdir(filingsDir, { recursive: true });
    const pdfFileName = `${filingId}.pdf`;
    const pdfPath = path.join(filingsDir, pdfFileName);
    await fs.writeFile(pdfPath, pdfBuffer);
    const pdfUrl = `/filings/${transaction.org_id}/${pdfFileName}`;

    const filing = await prisma.filing.create({
      data: {
        org_id: transaction.org_id,
        transaction_id: transaction.id,
        filing_data: filingData as unknown as Prisma.InputJsonValue,
        filing_type: "REAL_ESTATE_REPORT",
        status: FilingStatus.GENERATED,
        pdf_url: pdfUrl,
        validated_at: new Date(),
        generated_by: generatedBy,
      },
    });

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: TransactionStatus.FILED },
    });

    try {
      await logAudit({
        orgId: transaction.org_id,
        userId: user.id,
        action: "filing.generated",
        details: {
          filing_id: filing.id,
          filing_number: filingId,
          property_address: transaction.property_address,
        },
        transactionId: transaction.id,
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      });
    } catch (auditError) {
      console.error("[audit] Failed:", auditError);
    }

    return NextResponse.json({ filing, filingId }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Filing generation failed";
    const status =
      message === "Unauthorized" || message === "Organization required" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
