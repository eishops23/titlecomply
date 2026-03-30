import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { TransactionStatus } from "@/generated/prisma/enums";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { validateTransaction, type ValidatableTransaction } from "@/lib/validation";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({ id: z.string().uuid() });

export async function POST(
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

    const transaction = await prisma.transaction.findFirst({
      where: { id: parsed.data.id, org_id: organization.id },
      include: {
        entity_detail: true,
        trust_detail: true,
        beneficial_owners: true,
        organization: true,
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

    const result = validateTransaction(validatable);

    if (
      result.valid &&
      (transaction.status === TransactionStatus.COLLECTING ||
        transaction.status === TransactionStatus.VALIDATING)
    ) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: TransactionStatus.READY_TO_FILE },
      });
    }

    return NextResponse.json({ validation: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Validation failed";
    const status =
      message === "Unauthorized" || message === "Organization required" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
