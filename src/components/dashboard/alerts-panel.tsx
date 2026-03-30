"use client";

import { useTransition } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { acknowledgeAlert } from "@/app/(app)/dashboard/actions";
import type { Alert, AlertSeverity } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

type AlertRow = Pick<
  Alert,
  "id" | "title" | "message" | "severity" | "type"
>;

const severityStyles: Record<
  AlertSeverity,
  { badge: string; label: string }
> = {
  CRITICAL: {
    badge: "bg-red-100 text-red-900 border-red-200",
    label: "Critical",
  },
  HIGH: {
    badge: "bg-orange-100 text-orange-900 border-orange-200",
    label: "High",
  },
  MEDIUM: {
    badge: "bg-amber-100 text-amber-900 border-amber-200",
    label: "Medium",
  },
  LOW: {
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    label: "Low",
  },
};

export function AlertsPanel({ alerts }: { alerts: AlertRow[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <section className="flex flex-col rounded-lg border border-slate-200 bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">Alerts</h2>
        <Link
          href="/alerts"
          className="text-sm font-medium text-accent hover:underline"
        >
          View all
        </Link>
      </div>
      {alerts.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No active alerts.</p>
      ) : (
        <ul className="mt-3 flex max-h-[320px] flex-col gap-3 overflow-y-auto pr-1">
          {alerts.map((a) => (
            <li
              key={a.id}
              className="rounded-md border border-slate-100 bg-slate-50/80 p-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium",
                    severityStyles[a.severity].badge,
                  )}
                >
                  {severityStyles[a.severity].label}
                </span>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await acknowledgeAlert(a.id);
                    })
                  }
                  className="shrink-0 rounded border border-slate-200 bg-surface px-2 py-1 text-xs font-medium text-foreground hover:bg-slate-50 disabled:opacity-50"
                >
                  Acknowledge
                </button>
              </div>
              <p className="mt-2 text-sm font-medium text-foreground">
                {a.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {a.message}
              </p>
            </li>
          ))}
        </ul>
      )}
      {alerts.length > 0 && (
        <div className="mt-2 flex items-center gap-1 text-xs text-muted">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Unacknowledged alerts only
        </div>
      )}
    </section>
  );
}
