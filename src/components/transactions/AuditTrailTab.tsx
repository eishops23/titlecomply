"use client";

import * as React from "react";
import { Activity, AlertTriangle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Tooltip } from "@/components/ui/tooltip";

const ACTION_LABELS: Record<string, string> = {
  "transaction.created": "Transaction Created",
  "transaction.updated": "Transaction Updated",
  "transaction.screened": "Screening Completed",
  "transaction.status_changed": "Status Changed",
  "document.uploaded": "Document Uploaded",
  "document.extracted": "Document Extracted",
  "filing.generated": "Filing Generated",
  "filing.downloaded": "Filing Downloaded",
  "data.collected": "Data Updated",
  "beneficial_owner.added": "Beneficial Owner Added",
  "beneficial_owner.updated": "Beneficial Owner Updated",
};

type AuditLog = {
  id: string;
  action: string;
  details: unknown;
  ip_address: string | null;
  user_id: string | null;
  current_hash: string;
  previous_hash: string | null;
  created_at: string | Date;
  user?: { email: string; first_name: string | null; last_name: string | null } | null;
};

function formatDate(value: string | Date): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
}

function detailText(details: unknown): string {
  if (!details) return "No details";
  if (typeof details === "string") return details;
  if (typeof details === "object") return JSON.stringify(details);
  return String(details);
}

function dotClass(action: string): string {
  if (action.includes("created") || action.includes("generated")) return "bg-emerald-500";
  if (action.includes("status")) return "bg-amber-500";
  if (action.includes("delete")) return "bg-red-500";
  return "bg-blue-500";
}

export function AuditTrailTab({ transactionId }: { transactionId: string }) {
  const [auditLogs, setAuditLogs] = React.useState<AuditLog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    void (async () => {
      try {
        const response = await fetch(`/api/audit/${transactionId}`, { cache: "no-store" });
        const data = (await response.json()) as { auditLogs?: AuditLog[]; error?: string };
        if (!response.ok) throw new Error(data.error || "Failed to load audit trail");
        if (isMounted) setAuditLogs(data.auditLogs ?? []);
      } catch (loadError) {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : "Failed to load audit trail");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [transactionId]);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Audit Trail</CardTitle>
        <Tooltip content="Hash chain verification will be available after security setup.">
          <span>
            <Button variant="secondary" size="sm" disabled>
              <Lock className="h-4 w-4" />
              Verify Chain
            </Button>
          </span>
        </Tooltip>
      </CardHeader>
      <CardContent>
        {loading ? <p className="text-sm text-muted">Loading audit trail...</p> : null}
        {error ? (
          <p className="inline-flex items-center gap-1 text-sm text-danger">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </p>
        ) : null}
        {!loading && !error && auditLogs.length === 0 ? (
          <EmptyState
            icon={<Activity aria-hidden />}
            title="No activity yet"
            description="Actions will appear here as you work on this transaction."
          />
        ) : null}
        <div className="space-y-4">
          {auditLogs.map((entry) => (
            <div key={entry.id} className="flex gap-3 border-b border-slate-100 pb-4">
              <span className={`mt-1 h-2.5 w-2.5 rounded-full ${dotClass(entry.action)}`} />
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium">
                  {formatDate(entry.created_at)} — {ACTION_LABELS[entry.action] ?? entry.action}
                </p>
                <p className="break-words text-sm text-muted">{detailText(entry.details)}</p>
                <p className="text-xs text-muted">
                  By: {entry.user?.email ?? entry.user_id ?? "system"}{" "}
                  {entry.ip_address ? `| IP: ${entry.ip_address}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
