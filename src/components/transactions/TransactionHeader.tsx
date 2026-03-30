"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronDown, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Tooltip } from "@/components/ui/tooltip";
import { TransactionStatus } from "@/generated/prisma/enums";
import { statusToBadgeVariant } from "@/lib/transactions-labels";

export const STATUS_COLORS: Record<string, string> = {
  SCREENING: "gray",
  REQUIRES_FILING: "blue",
  NO_FILING_REQUIRED: "slate",
  COLLECTING: "blue",
  VALIDATING: "amber",
  READY_TO_FILE: "green",
  FILED: "green",
  ACCEPTED: "green",
  REJECTED: "red",
  ARCHIVED: "slate",
};

export const STATUS_LABELS: Record<string, string> = {
  SCREENING: "Screening",
  REQUIRES_FILING: "Requires Filing",
  NO_FILING_REQUIRED: "No Filing Required",
  COLLECTING: "Collecting Data",
  VALIDATING: "Validating",
  READY_TO_FILE: "Ready to File",
  FILED: "Filed",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  ARCHIVED: "Archived",
};

const VALID_TRANSITIONS: Record<string, Array<{ status: string; label: string }>> = {
  COLLECTING: [
    { status: "VALIDATING", label: "Mark as Validating" },
    { status: "ARCHIVED", label: "Archive" },
  ],
  VALIDATING: [
    { status: "READY_TO_FILE", label: "Mark as Ready to File" },
    { status: "COLLECTING", label: "Back to Collecting" },
  ],
  READY_TO_FILE: [{ status: "VALIDATING", label: "Back to Validating" }],
  FILED: [
    { status: "ACCEPTED", label: "Mark as Accepted" },
    { status: "REJECTED", label: "Mark as Rejected" },
  ],
  REJECTED: [{ status: "READY_TO_FILE", label: "Back to Ready to File" }],
};

interface TransactionHeaderProps {
  transaction: {
    id: string;
    file_number: string | null;
    property_address: string;
    property_city: string;
    property_state: string;
    property_zip: string;
    status: string;
    buyer_type: string | null;
    purchase_price: unknown;
    closing_date: string | Date | null;
    screening_result: string | null;
    assigned_to: { first_name: string | null; last_name: string | null; email: string } | null;
    created_by: { first_name: string | null; last_name: string | null; email: string };
    created_at: string | Date;
  };
  onStatusChange?: () => void;
}

function displayName(person: { first_name: string | null; last_name: string | null; email: string }) {
  const full = [person.first_name, person.last_name].filter(Boolean).join(" ");
  return full || person.email;
}

function formatCurrency(value: unknown): string {
  if (value === null || value === "") return "—";
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number(
            value && typeof value === "object" && "toString" in value
              ? String((value as { toString: () => string }).toString())
              : NaN,
          );
  if (!Number.isFinite(parsed)) return String(value);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(parsed);
}

function formatDate(value: string | Date | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatRelative(value: string | Date): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const diff = date.getTime() - Date.now();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));
  if (Math.abs(days) <= 1) return days === 0 ? "today" : days > 0 ? "tomorrow" : "yesterday";
  return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ${days > 0 ? "from now" : "ago"}`;
}

export function TransactionHeader({ transaction, onStatusChange }: TransactionHeaderProps) {
  const router = useRouter();
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const transitions = VALID_TRANSITIONS[transaction.status] ?? [];

  async function updateStatus(nextStatus: string) {
    setLoading(true);
    try {
      const response = await fetch(`/api/transactions/${transaction.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to update status");
      }
      setStatusOpen(false);
      onStatusChange?.();
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Failed to update status");
    } finally {
      setLoading(false);
    }
  }

  async function archiveTransaction() {
    setLoading(true);
    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to archive transaction");
      }
      router.push("/transactions");
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Failed to archive transaction");
    } finally {
      setLoading(false);
      setDeleteOpen(false);
    }
  }

  return (
    <div className="rounded-md border border-slate-200 bg-surface p-5">
      <Link href="/transactions" className="text-sm text-accent hover:underline">
        ← Back to Transactions
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {transaction.property_address}, {transaction.property_city}, {transaction.property_state}{" "}
            {transaction.property_zip}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span>File #: {transaction.file_number ?? "—"}</span>
            <span>|</span>
            <span>Created: {formatRelative(transaction.created_at)}</span>
            <span>|</span>
            <span>Buyer: {transaction.buyer_type ?? "—"}</span>
          </div>
        </div>
        <Badge variant={statusToBadgeVariant(transaction.status as TransactionStatus)}>
          {transaction.status === "ACCEPTED" ? (
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {STATUS_LABELS[transaction.status] ?? transaction.status}
            </span>
          ) : (
            STATUS_LABELS[transaction.status] ?? transaction.status
          )}
        </Badge>
      </div>

      <div className="mt-3 grid gap-1 text-sm text-foreground">
        <p>
          Assigned to:{" "}
          <span className="text-muted">
            {transaction.assigned_to ? displayName(transaction.assigned_to) : "Unassigned"}
          </span>
        </p>
        <p>
          Purchase Price: <span className="text-muted">{formatCurrency(transaction.purchase_price)}</span>{" "}
          | Closing: <span className="text-muted">{formatDate(transaction.closing_date)}</span>
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/transactions/${transaction.id}/edit`}>
          <Button variant="secondary">Edit</Button>
        </Link>

        <div className="relative">
          <Button variant="secondary" onClick={() => setStatusOpen((v) => !v)}>
            Change Status <ChevronDown className="h-4 w-4" />
          </Button>
          {statusOpen ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-30"
                aria-label="Close status menu"
                onClick={() => setStatusOpen(false)}
              />
              <div className="absolute z-40 mt-1 min-w-[220px] rounded-md border border-slate-200 bg-surface py-1 shadow-md">
                {transitions.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-muted">No valid transitions</p>
                ) : (
                  transitions.map((item) => (
                    <button
                      key={item.status}
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                      onClick={() => void updateStatus(item.status)}
                      disabled={loading}
                    >
                      {item.label}
                    </button>
                  ))
                )}
              </div>
            </>
          ) : null}
        </div>

        <Tooltip content="Archives this transaction (soft delete).">
          <Button variant="ghost" className="text-danger hover:bg-red-50" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </Tooltip>
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Archive transaction?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={loading} onClick={() => void archiveTransaction()}>
              Yes, Archive
            </Button>
          </>
        }
      >
        <p>Are you sure? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
