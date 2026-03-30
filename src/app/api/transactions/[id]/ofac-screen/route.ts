import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { AlertSeverity, AlertType } from "@/generated/prisma/enums";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getClientIp, getUserAgent, logAudit } from "@/lib/audit";
import { screenTransactionParties } from "@/lib/ofac";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { user, organization } = await resolveUser();
    const { id } = await context.params;
    const transaction = await prisma.transaction.findFirst({
      where: { id, org_id: organization.id },
      include: { entity_detail: true, trust_detail: true, beneficial_owners: true },
    });
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const screening = await screenTransactionParties({
      id: transaction.id,
      entity_detail: transaction.entity_detail,
      trust_detail: transaction.trust_detail,
      beneficial_owners: transaction.beneficial_owners,
      data_collection:
        transaction.data_collection && typeof transaction.data_collection === "object"
          ? (transaction.data_collection as Record<string, unknown>)
          : null,
    });

    const current =
      transaction.data_collection && typeof transaction.data_collection === "object" && !Array.isArray(transaction.data_collection)
        ? (transaction.data_collection as Record<string, unknown>)
        : {};
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { data_collection: ({ ...current, ofac: screening } as unknown) as Prisma.InputJsonObject },
    });

    if (screening.overallStatus === "MATCH") {
      await prisma.alert.create({
        data: {
          org_id: organization.id,
          transaction_id: transaction.id,
          type: AlertType.REGULATION_UPDATE,
          severity: AlertSeverity.CRITICAL,
          title: "OFAC match detected",
          message: "DO NOT PROCEED. One or more parties matched OFAC SDN list.",
        },
      });
    }

    await logAudit({
      orgId: organization.id,
      userId: user.id,
      action: "ofac.screened",
      transactionId: transaction.id,
      details: { overallStatus: screening.overallStatus, certificateId: screening.certificateId },
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json({ screening });
  } catch (error) {
    const message = error instanceof Error ? error.message : "OFAC screening failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
