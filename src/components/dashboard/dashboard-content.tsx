import Link from "next/link";
import {
  Activity,
  ArrowLeftRight,
  Building2,
  FileText,
  Shield,
  Upload,
  User,
} from "lucide-react";
import type { AuditLog, User as DbUser } from "@/generated/prisma/client";
import { formatAuditDescription } from "@/lib/audit-copy";
import {
  PIPELINE_CONFIG,
  PIPELINE_KEYS,
  type PipelineKey,
} from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";
import { AlertsPanel } from "./alerts-panel";
import { FilingsUsageChart } from "./filings-usage-chart";

type AuditWithUser = AuditLog & {
  user: Pick<DbUser, "id" | "first_name" | "last_name" | "email"> | null;
};

type AlertRow = {
  id: string;
  title: string;
  message: string;
  severity: import("@/generated/prisma/client").AlertSeverity;
  type: import("@/generated/prisma/client").AlertType;
};

export type DashboardContentProps = {
  activeTransactions: number;
  requiringAction: number;
  overdueItems: number;
  complianceScore: number;
  pipeline: Record<PipelineKey, number>;
  recentAuditLogs: AuditWithUser[];
  alerts: AlertRow[];
  filingsThisMonth: number;
  planLimit: number | null;
};

const pipelineCardStyles: Record<
  PipelineKey,
  { border: string; bg: string; hover: string; label: string }
> = {
  screening: {
    border: "border-slate-200",
    bg: "bg-slate-50",
    hover: "hover:bg-slate-100",
    label: "text-slate-800",
  },
  collecting: {
    border: "border-blue-200",
    bg: "bg-blue-50",
    hover: "hover:bg-blue-100/90",
    label: "text-blue-950",
  },
  validating: {
    border: "border-amber-200",
    bg: "bg-amber-50",
    hover: "hover:bg-amber-100/90",
    label: "text-amber-950",
  },
  ready_to_file: {
    border: "border-emerald-300",
    bg: "bg-emerald-50",
    hover: "hover:bg-emerald-100/90",
    label: "text-emerald-950",
  },
  filed: {
    border: "border-emerald-800",
    bg: "bg-emerald-950/10",
    hover: "hover:bg-emerald-950/15",
    label: "text-emerald-950",
  },
};

function auditIcon(action: string) {
  if (action.includes("DOCUMENT")) return Upload;
  if (action.includes("FILING") || action.includes("FILE")) return FileText;
  if (action.includes("TRANSACTION")) return ArrowLeftRight;
  if (action.includes("ORG") || action.includes("SETTINGS")) return Building2;
  if (action.includes("USER") || action.includes("ROLE")) return User;
  if (action.includes("SCREENING")) return Shield;
  return Activity;
}

function userLabel(u: AuditWithUser["user"]): string {
  if (!u) return "System";
  const name = [u.first_name, u.last_name].filter(Boolean).join(" ");
  return name || u.email;
}

function formatTs(d: Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function DashboardContent(props: DashboardContentProps) {
  const {
    activeTransactions,
    requiringAction,
    overdueItems,
    complianceScore,
    pipeline,
    recentAuditLogs,
    alerts,
    filingsThisMonth,
    planLimit,
  } = props;

  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted">
            Compliance overview for your organization
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/transactions/new"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
          >
            New Transaction
          </Link>
          <Link
            href="/reports"
            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-surface px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-slate-50"
          >
            Generate Report
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-surface p-4 shadow-sm">
          <p className="text-sm font-medium text-muted">Active Transactions</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
            {activeTransactions}
          </p>
          <p className="mt-2 text-sm text-muted">
            {requiringAction} requiring action
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-surface p-4 shadow-sm">
          <p className="text-sm font-medium text-muted">Filings This Month</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
            {filingsThisMonth}
          </p>
          <FilingsUsageChart used={filingsThisMonth} limit={planLimit} />
        </div>

        <div className="rounded-lg border border-slate-200 bg-surface p-4 shadow-sm">
          <p className="text-sm font-medium text-muted">Overdue Items</p>
          <p
            className={cn(
              "mt-2 text-3xl font-semibold tabular-nums",
              overdueItems > 0 ? "text-red-600" : "text-foreground",
            )}
          >
            {overdueItems}
          </p>
          <p className="mt-2 text-sm text-muted">
            Past closing without resolution
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-surface p-4 shadow-sm">
          <p className="text-sm font-medium text-muted">Compliance Score</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
            {complianceScore}%
          </p>
          <p className="mt-2 text-sm text-muted">
            Files filed on time vs. completed files
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-foreground">
          Transaction pipeline
        </h2>
        <p className="mt-1 text-xs text-muted">
          Click a stage to filter the transaction list
        </p>
        <div className="mt-4 flex flex-wrap gap-3 lg:flex-nowrap">
          {PIPELINE_KEYS.map((key) => {
            const cfg = PIPELINE_CONFIG[key];
            const styles = pipelineCardStyles[key];
            return (
              <Link
                key={key}
                href={`/transactions?pipeline=${key}`}
                className={cn(
                  "flex min-w-[140px] flex-1 flex-col rounded-lg border p-4 transition",
                  styles.border,
                  styles.bg,
                  styles.hover,
                )}
              >
                <span
                  className={cn(
                    "text-xs font-medium uppercase tracking-wide",
                    styles.label,
                  )}
                >
                  {cfg.label}
                </span>
                <span
                  className={cn(
                    "mt-2 text-2xl font-semibold tabular-nums",
                    styles.label,
                  )}
                >
                  {pipeline[key]}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="flex flex-col rounded-lg border border-slate-200 bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">
              Recent activity
            </h2>
            <Link
              href="/audit-log"
              className="text-sm font-medium text-accent hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="mt-4 flex flex-col gap-4">
            {recentAuditLogs.length === 0 ? (
              <li className="text-sm text-muted">No audit entries yet.</li>
            ) : (
              recentAuditLogs.map((entry) => {
                const Icon = auditIcon(entry.action);
                return (
                  <li key={entry.id} className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">
                        {formatAuditDescription(entry.action, entry.details)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {userLabel(entry.user)} · {formatTs(entry.created_at)}
                      </p>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </section>

        <AlertsPanel alerts={alerts} />
      </div>
    </div>
  );
}
