"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type AlertSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
type AlertType =
  | "OVERDUE_FILING"
  | "MISSING_DATA"
  | "SCREENING_REQUIRED"
  | "FILING_REJECTED"
  | "SUBSCRIPTION_EXPIRING"
  | "MONTHLY_LIMIT_APPROACHING"
  | "REGULATION_UPDATE";

export type AlertListItem = {
  id: string;
  transaction_id: string | null;
  severity: AlertSeverity;
  type: AlertType;
  title: string;
  message: string;
  acknowledged: boolean;
  acknowledged_by: string | null;
  acknowledged_at: Date | string | null;
  created_at: Date | string;
  transaction: {
    id: string;
    file_number: string | null;
    property_address: string;
    property_city: string;
    property_state: string;
  } | null;
};

const SEVERITY_WEIGHT: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const ALERT_TYPE_LABELS: Record<string, string> = {
  OVERDUE_FILING: "Overdue Filing",
  MISSING_DATA: "Missing Data",
  SCREENING_REQUIRED: "Screening Required",
  FILING_REJECTED: "Filing Rejected",
  SUBSCRIPTION_EXPIRING: "Subscription Expiring",
  MONTHLY_LIMIT_APPROACHING: "Monthly Limit",
  REGULATION_UPDATE: "Regulation Update",
};

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function relativeTime(date: Date): string {
  const diff = date.getTime() - Date.now();
  const sec = Math.round(diff / 1000);
  const absSec = Math.abs(sec);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (absSec < 60) return rtf.format(sec, "second");
  const min = Math.round(diff / 60000);
  if (Math.abs(min) < 60) return rtf.format(min, "minute");
  const hour = Math.round(diff / 3600000);
  if (Math.abs(hour) < 24) return rtf.format(hour, "hour");
  const day = Math.round(diff / 86400000);
  if (Math.abs(day) < 30) return rtf.format(day, "day");
  const month = Math.round(diff / (86400000 * 30));
  if (Math.abs(month) < 12) return rtf.format(month, "month");
  return rtf.format(Math.round(diff / (86400000 * 365)), "year");
}

function severityClasses(severity: AlertSeverity): string {
  if (severity === "CRITICAL") return "bg-red-50 text-red-800 ring-red-200";
  if (severity === "HIGH") return "bg-orange-50 text-orange-800 ring-orange-200";
  if (severity === "MEDIUM") return "bg-amber-50 text-amber-900 ring-amber-200";
  return "bg-blue-50 text-blue-800 ring-blue-200";
}

function dotClasses(severity: AlertSeverity): string {
  if (severity === "CRITICAL") return "bg-red-600 animate-pulse";
  if (severity === "HIGH") return "bg-orange-500";
  if (severity === "MEDIUM") return "bg-amber-500";
  return "bg-blue-500";
}

export function AlertsClient({ alerts }: { alerts: AlertListItem[] }) {
  const router = useRouter();
  const [items, setItems] = React.useState(alerts);
  const [severityFilter, setSeverityFilter] = React.useState<string>("all");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(false);

  const visible = React.useMemo(() => {
    let next = [...items];
    if (severityFilter !== "all") {
      next = next.filter((alert) => alert.severity === severityFilter);
    }
    if (typeFilter !== "all") {
      next = next.filter((alert) => alert.type === typeFilter);
    }
    if (statusFilter === "active") {
      next = next.filter((alert) => !alert.acknowledged);
    } else if (statusFilter === "acknowledged") {
      next = next.filter((alert) => alert.acknowledged);
    }
    next.sort((a, b) => {
      if (a.acknowledged !== b.acknowledged) {
        return a.acknowledged ? 1 : -1;
      }
      const severityDelta =
        SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity];
      if (severityDelta !== 0) return severityDelta;
      return toDate(b.created_at).getTime() - toDate(a.created_at).getTime();
    });
    return next;
  }, [items, severityFilter, statusFilter, typeFilter]);

  const activeCount = items.filter((a) => !a.acknowledged).length;

  const acknowledgeOne = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/alerts/${id}/acknowledge`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Acknowledge failed");
      }
      setItems((prev) =>
        prev.map((alert) =>
          alert.id === id
            ? {
                ...alert,
                acknowledged: true,
                acknowledged_at: new Date().toISOString(),
                acknowledged_by: "system",
              }
            : alert,
        ),
      );
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      router.refresh();
    } catch {
      window.alert("Could not acknowledge alert.");
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeBulk = async (ids: string[]) => {
    if (ids.length === 0) return;
    setLoading(true);
    try {
      const response = await fetch("/api/alerts/bulk-acknowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertIds: ids }),
      });
      if (!response.ok) {
        throw new Error("Bulk acknowledge failed");
      }
      const now = new Date().toISOString();
      setItems((prev) =>
        prev.map((alert) =>
          ids.includes(alert.id)
            ? {
                ...alert,
                acknowledged: true,
                acknowledged_at: now,
                acknowledged_by: "system",
              }
            : alert,
        ),
      );
      setSelectedIds(new Set());
      router.refresh();
    } catch {
      window.alert("Could not acknowledge selected alerts.");
    } finally {
      setLoading(false);
    }
  };

  const onAcknowledgeAll = () => {
    const activeIds = items.filter((a) => !a.acknowledged).map((a) => a.id);
    if (activeIds.length === 0) return;
    const ok = window.confirm(
      `Acknowledge all ${activeIds.length} active alerts?`,
    );
    if (!ok) return;
    void acknowledgeBulk(activeIds);
  };

  const clearFilters = () => {
    setSeverityFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  const hasFilters =
    severityFilter !== "all" || typeFilter !== "all" || statusFilter !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Compliance Alerts</h1>
          <p className="mt-1 text-sm text-muted">{activeCount} active alerts</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={loading}
              onClick={() => void acknowledgeBulk([...selectedIds])}
            >
              Acknowledge Selected ({selectedIds.size})
            </Button>
          ) : null}
          {activeCount > 0 ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={loading}
              onClick={onAcknowledgeAll}
            >
              Acknowledge All
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3">
        <div className="min-w-[160px] flex-1">
          <Select
            label="Severity"
            value={severityFilter}
            options={[
              { value: "all", label: "All" },
              { value: "CRITICAL", label: "Critical" },
              { value: "HIGH", label: "High" },
              { value: "MEDIUM", label: "Medium" },
              { value: "LOW", label: "Low" },
            ]}
            onChange={(e) => setSeverityFilter(e.target.value)}
          />
        </div>
        <div className="min-w-[220px] flex-1">
          <Select
            label="Type"
            value={typeFilter}
            options={[
              { value: "all", label: "All" },
              { value: "OVERDUE_FILING", label: "Overdue Filing" },
              { value: "MISSING_DATA", label: "Missing Data" },
              { value: "SCREENING_REQUIRED", label: "Screening Required" },
              { value: "FILING_REJECTED", label: "Filing Rejected" },
              { value: "SUBSCRIPTION_EXPIRING", label: "Subscription Expiring" },
              { value: "MONTHLY_LIMIT_APPROACHING", label: "Monthly Limit" },
              { value: "REGULATION_UPDATE", label: "Regulation Update" },
            ]}
            onChange={(e) => setTypeFilter(e.target.value)}
          />
        </div>
        <div className="min-w-[180px] flex-1">
          <Select
            label="Status"
            value={statusFilter}
            options={[
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "acknowledged", label: "Acknowledged" },
            ]}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!hasFilters}
          onClick={clearFilters}
        >
          Clear Filters
        </Button>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<Bell aria-hidden />}
          title="No alerts"
          description="You're all caught up. Active alerts will appear here when compliance actions are needed."
        />
      ) : (
        <div className="space-y-3">
          {visible.map((alert) => {
            const created = toDate(alert.created_at);
            const acknowledgedDate = alert.acknowledged_at
              ? toDate(alert.acknowledged_at)
              : null;
            return (
              <article
                key={alert.id}
                className={cn(
                  "rounded-lg border border-slate-200 bg-surface p-4",
                  alert.acknowledged && "opacity-60",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {!alert.acknowledged ? (
                      <input
                        type="checkbox"
                        aria-label={`Select alert ${alert.title}`}
                        checked={selectedIds.has(alert.id)}
                        onChange={(e) =>
                          setSelectedIds((prev) => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(alert.id);
                            else next.delete(alert.id);
                            return next;
                          })
                        }
                      />
                    ) : null}
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
                        severityClasses(alert.severity),
                      )}
                    >
                      <span className={cn("h-2 w-2 rounded-full", dotClasses(alert.severity))} />
                      {alert.severity}
                    </span>
                    <span className="text-xs font-medium tracking-wide text-muted uppercase">
                      {ALERT_TYPE_LABELS[alert.type]}
                    </span>
                  </div>
                  <Tooltip content={created.toLocaleString()}>
                    <time className="text-xs text-muted">{relativeTime(created)}</time>
                  </Tooltip>
                </div>

                <h3 className="mt-3 text-sm font-semibold text-foreground">{alert.title}</h3>
                <p className="mt-1 text-sm text-muted">{alert.message}</p>

                {alert.transaction_id && alert.transaction ? (
                  <div className="mt-3 text-sm">
                    <span className="text-muted">Transaction: </span>
                    <Link
                      href={`/transactions/${alert.transaction_id}`}
                      className="text-accent hover:underline"
                    >
                      {alert.transaction.property_address}, {alert.transaction.property_city},{" "}
                      {alert.transaction.property_state}
                    </Link>
                  </div>
                ) : null}

                <div className="mt-3">
                  {!alert.acknowledged ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      loading={loading}
                      onClick={() => void acknowledgeOne(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  ) : (
                    <p className="text-xs text-muted">
                      <AlertCircle className="mr-1 inline h-3.5 w-3.5" />
                      Acknowledged by {alert.acknowledged_by ?? "system"}
                      {acknowledgedDate ? ` on ${acknowledgedDate.toLocaleString()}` : ""}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
