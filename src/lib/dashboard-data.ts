import {
  AlertSeverity,
  FilingStatus,
  TransactionStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import {
  PIPELINE_CONFIG,
  PIPELINE_KEYS,
  type PipelineKey,
} from "@/lib/pipeline-config";

export {
  PIPELINE_CONFIG,
  PIPELINE_KEYS,
  parsePipelineParam,
  type PipelineKey,
} from "@/lib/pipeline-config";

/** Open pipeline work (not yet filed or accepted) */
const ACTIVE_STATUSES: TransactionStatus[] = [
  TransactionStatus.SCREENING,
  TransactionStatus.REQUIRES_FILING,
  TransactionStatus.NO_FILING_REQUIRED,
  TransactionStatus.COLLECTING,
  TransactionStatus.VALIDATING,
  TransactionStatus.READY_TO_FILE,
];

const OVERDUE_EXCLUDED: TransactionStatus[] = [
  TransactionStatus.FILED,
  TransactionStatus.ACCEPTED,
  TransactionStatus.ARCHIVED,
  TransactionStatus.REJECTED,
  TransactionStatus.NO_FILING_REQUIRED,
];

const severityRank: Record<AlertSeverity, number> = {
  [AlertSeverity.CRITICAL]: 0,
  [AlertSeverity.HIGH]: 1,
  [AlertSeverity.MEDIUM]: 2,
  [AlertSeverity.LOW]: 3,
};

export async function getDashboardData(orgId: string) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    activeTransactions,
    requiringAction,
    overdueItems,
    pipelineGroups,
    complianceRows,
    recentAuditLogs,
    unackedAlerts,
    orgUsage,
  ] = await Promise.all([
    prisma.transaction.count({
      where: {
        org_id: orgId,
        status: { in: ACTIVE_STATUSES },
      },
    }),
    prisma.alert.count({
      where: { org_id: orgId, acknowledged: false },
    }),
    prisma.transaction.count({
      where: {
        org_id: orgId,
        closing_date: { lt: startOfToday },
        status: { notIn: OVERDUE_EXCLUDED },
      },
    }),
    prisma.transaction.groupBy({
      by: ["status"],
      where: { org_id: orgId },
      _count: { _all: true },
    }),
    prisma.transaction.findMany({
      where: {
        org_id: orgId,
        status: {
          in: [TransactionStatus.FILED, TransactionStatus.ACCEPTED],
        },
      },
      select: {
        closing_date: true,
        filings: {
          where: {
            status: { in: [FilingStatus.FILED, FilingStatus.ACCEPTED] },
            filed_at: { not: null },
          },
          orderBy: { filed_at: "asc" },
          take: 1,
          select: { filed_at: true },
        },
      },
    }),
    prisma.auditLog.findMany({
      where: { org_id: orgId },
      orderBy: { created_at: "desc" },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    }),
    prisma.alert.findMany({
      where: { org_id: orgId, acknowledged: false },
      orderBy: [{ created_at: "desc" }],
      take: 12,
    }),
    prisma.organization.findUniqueOrThrow({
      where: { id: orgId },
      select: {
        monthly_transaction_count: true,
        monthly_transaction_limit: true,
        plan: true,
      },
    }),
  ]);

  const statusCounts = new Map<TransactionStatus, number>();
  for (const row of pipelineGroups) {
    statusCounts.set(row.status, row._count._all);
  }

  const pipeline: Record<PipelineKey, number> = {
    screening: 0,
    collecting: 0,
    validating: 0,
    ready_to_file: 0,
    filed: 0,
  };

  for (const key of PIPELINE_KEYS) {
    const { statuses } = PIPELINE_CONFIG[key];
    let sum = 0;
    for (const s of statuses) {
      sum += statusCounts.get(s) ?? 0;
    }
    pipeline[key] = sum;
  }

  let onTime = 0;
  let totalForScore = 0;
  for (const row of complianceRows) {
    const filed = row.filings[0]?.filed_at;
    if (!filed) continue;
    totalForScore += 1;
    if (!row.closing_date || filed <= row.closing_date) {
      onTime += 1;
    }
  }
  const complianceScore =
    totalForScore === 0 ? 100 : Math.round((onTime / totalForScore) * 100);

  const alertsSorted = [...unackedAlerts].sort((a, b) => {
    const sev = severityRank[a.severity] - severityRank[b.severity];
    if (sev !== 0) return sev;
    return b.created_at.getTime() - a.created_at.getTime();
  });

  return {
    activeTransactions,
    requiringAction,
    overdueItems,
    pipeline,
    complianceScore,
    recentAuditLogs,
    alerts: alertsSorted.slice(0, 8),
    filingsThisMonth: orgUsage.monthly_transaction_count,
    planLimit: orgUsage.monthly_transaction_limit,
    plan: orgUsage.plan,
  };
}
