import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { ScreeningResult, TransactionStatus } from "@/generated/prisma/enums";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getClientIp, getUserAgent, logAudit } from "@/lib/audit";
import { runScreening, type PropertyType } from "@/lib/screening";

const screenRequestSchema = z.object({
  overrideResult: z.nativeEnum(ScreeningResult).optional(),
  overrideReason: z.string().trim().max(300).optional(),
});

function parsePropertyType(jsonValue: Prisma.JsonValue | null): PropertyType | null {
  if (
    !jsonValue ||
    typeof jsonValue !== "object" ||
    Array.isArray(jsonValue) ||
    !("screening" in jsonValue)
  ) {
    return null;
  }

  const screening = jsonValue.screening;
  if (!screening || typeof screening !== "object" || Array.isArray(screening)) {
    return null;
  }

  const propertyType =
    "property_type" in screening ? screening.property_type : null;

  const values: PropertyType[] = [
    "single_family",
    "condo",
    "multi_family",
    "townhouse",
    "land",
    "commercial",
  ];

  return typeof propertyType === "string" && values.includes(propertyType as PropertyType)
    ? (propertyType as PropertyType)
    : null;
}

function statusForResult(result: ScreeningResult): TransactionStatus {
  if (result === ScreeningResult.REQUIRED) {
    return TransactionStatus.REQUIRES_FILING;
  }
  if (result === ScreeningResult.NOT_REQUIRED) {
    return TransactionStatus.NO_FILING_REQUIRED;
  }
  return TransactionStatus.SCREENING;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { user, organization } = await resolveUser();
    const { id } = await context.params;

    const rawBody = await request.json().catch(() => ({}));
    const parsedBody = screenRequestSchema.safeParse(rawBody);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsedBody.error.flatten() },
        { status: 400 },
      );
    }

    const transaction = await prisma.transaction.findFirst({
      where: { id, org_id: organization.id },
      select: {
        id: true,
        org_id: true,
        buyer_type: true,
        financing_status: true,
        purchase_price: true,
        data_collection: true,
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (!transaction.buyer_type || !transaction.financing_status) {
      return NextResponse.json(
        { error: "Missing screening inputs on transaction" },
        { status: 400 },
      );
    }

    const propertyType = parsePropertyType(transaction.data_collection);
    let result: ScreeningResult;
    let reason: string;

    if (parsedBody.data.overrideResult) {
      result = parsedBody.data.overrideResult;
      reason =
        parsedBody.data.overrideReason?.trim() ||
        `Manual screening override set to ${parsedBody.data.overrideResult}.`;
    } else if (!propertyType) {
      result = ScreeningResult.NEEDS_REVIEW;
      reason =
        "Property type is missing or unsupported, so manual review is required.";
    } else {
      const output = runScreening({
        propertyType,
        buyerType: transaction.buyer_type,
        financingStatus: transaction.financing_status,
        purchasePrice: transaction.purchase_price
          ? Number(transaction.purchase_price)
          : null,
      });
      result = output.result;
      reason = output.reason;
    }

    const status = statusForResult(result);
    const updated = await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        screening_result: result,
        screening_reason: reason,
        screened_at: new Date(),
        status,
      },
      select: {
        id: true,
        status: true,
        screening_result: true,
        screening_reason: true,
      },
    });

    try {
      await logAudit({
        orgId: transaction.org_id,
        userId: user.id,
        action: "transaction.screened",
        details: {
          result: updated.screening_result,
          status: updated.status,
          override: Boolean(parsedBody.data.overrideResult),
        },
        transactionId: updated.id,
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      });
    } catch (auditError) {
      console.error("[audit] Failed:", auditError);
    }

    return NextResponse.json({ screening: updated });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to screen transaction";
    const status =
      message === "Unauthorized" || message === "Organization required"
        ? 401
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
