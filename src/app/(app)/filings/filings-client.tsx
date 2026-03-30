"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type SortDirection,
} from "@/components/ui/table";
import { Tooltip } from "@/components/ui/tooltip";
import { toastError } from "@/lib/toast";
import { cn } from "@/lib/utils";

type FilingStatus =
  | "DRAFT"
  | "VALIDATED"
  | "GENERATED"
  | "FILED"
  | "ACCEPTED"
  | "REJECTED"
  | "AMENDED";

type FilingDataShape = {
  filing_id?: string;
};

export type FilingListItem = {
  id: string;
  transaction_id: string;
  status: FilingStatus;
  filing_data: unknown;
  pdf_url: string | null;
  generated_by: string;
  created_at: Date | string;
  transaction: {
    id: string;
    file_number: string | null;
    property_address: string;
    property_city: string;
    property_state: string;
    property_zip: string;
  } | null;
};

const FILING_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  VALIDATED: "Validated",
  GENERATED: "Generated",
  FILED: "Filed",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  AMENDED: "Amended",
};

const FILING_STATUS_COLORS: Record<string, string> = {
  DRAFT: "gray",
  VALIDATED: "blue",
  GENERATED: "amber",
  FILED: "green",
  ACCEPTED: "green",
  REJECTED: "red",
  AMENDED: "purple",
};

type SortKey = "filingId" | "status" | "generatedDate";

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

function formatRelativeDate(date: Date): string {
  const now = Date.now();
  const diff = date.getTime() - now;
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

function getFilingId(filing: FilingListItem): string {
  const data = filing.filing_data as FilingDataShape | null;
  return data?.filing_id?.trim() || filing.id.slice(0, 8).toUpperCase();
}

function getStatusBadgeClass(status: FilingStatus): string {
  const color = FILING_STATUS_COLORS[status];
  switch (color) {
    case "gray":
      return "bg-slate-100 text-slate-700 ring-slate-200";
    case "blue":
      return "bg-blue-50 text-blue-800 ring-blue-200";
    case "amber":
      return "bg-amber-50 text-amber-900 ring-amber-200";
    case "green":
      return status === "ACCEPTED"
        ? "bg-emerald-100 text-emerald-900 ring-emerald-300"
        : "bg-emerald-50 text-emerald-900 ring-emerald-200";
    case "red":
      return "bg-red-50 text-red-800 ring-red-200";
    case "purple":
      return "bg-purple-50 text-purple-800 ring-purple-200";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
}

export function FilingsClient({ filings }: { filings: FilingListItem[] }) {
  const router = useRouter();
  const [items, setItems] = React.useState(filings);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [fromDate, setFromDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");
  const [search, setSearch] = React.useState<string>("");
  const [sortKey, setSortKey] = React.useState<SortKey>("generatedDate");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const updateStatus = async (id: string, status: FilingStatus) => {
    setUpdatingId(id);
    try {
      const response = await fetch(`/api/filings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("Failed to update filing status");
      }
      const data = (await response.json()) as { filing: { status: FilingStatus } };
      setItems((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: data.filing.status } : f)),
      );
      router.refresh();
    } catch {
      toastError("Update failed", "Could not update filing status.");
    } finally {
      setUpdatingId(null);
      setMenuOpenId(null);
    }
  };

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    let next = [...items];

    if (statusFilter !== "all") {
      next = next.filter((item) => item.status === statusFilter);
    }

    if (fromDate) {
      const from = new Date(`${fromDate}T00:00:00`);
      next = next.filter((item) => toDate(item.created_at) >= from);
    }

    if (endDate) {
      const to = new Date(`${endDate}T23:59:59.999`);
      next = next.filter((item) => toDate(item.created_at) <= to);
    }

    if (q) {
      next = next.filter((item) => {
        const filingId = getFilingId(item).toLowerCase();
        const addr = item.transaction?.property_address?.toLowerCase() ?? "";
        return filingId.includes(q) || addr.includes(q);
      });
    }

    next.sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;
      if (sortKey === "filingId") {
        return getFilingId(a).localeCompare(getFilingId(b)) * dir;
      }
      if (sortKey === "status") {
        return a.status.localeCompare(b.status) * dir;
      }
      return (toDate(a.created_at).getTime() - toDate(b.created_at).getTime()) * dir;
    });

    return next;
  }, [endDate, fromDate, items, search, sortDirection, sortKey, statusFilter]);

  const onSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection(key === "generatedDate" ? "desc" : "asc");
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setFromDate("");
    setEndDate("");
    setSearch("");
  };

  const hasFilters = statusFilter !== "all" || fromDate || endDate || search.trim();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Filings</h1>
          <p className="mt-1 text-sm text-muted">
            All generated FinCEN Real Estate Reports
          </p>
        </div>
        <p className="text-sm text-muted">
          Showing{" "}
          <span className="font-medium text-foreground tabular-nums">
            {filtered.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground tabular-nums">
            {items.length}
          </span>{" "}
          filings
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3">
        <div className="min-w-[160px] flex-1">
          <Select
            label="Status"
            value={statusFilter}
            options={[
              { value: "all", label: "All" },
              { value: "DRAFT", label: "Draft" },
              { value: "VALIDATED", label: "Validated" },
              { value: "GENERATED", label: "Generated" },
              { value: "FILED", label: "Filed" },
              { value: "ACCEPTED", label: "Accepted" },
              { value: "REJECTED", label: "Rejected" },
              { value: "AMENDED", label: "Amended" },
            ]}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
        <div className="min-w-[220px] flex-1">
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="From"
              variant="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <Input
              label="To"
              variant="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="min-w-[220px] flex-[2]">
          <Input
            label="Search"
            placeholder="Filing ID or property address"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="pb-0.5">
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
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<FileText aria-hidden />}
          title="No filings yet"
          description="Generate your first filing from a transaction."
          action={{
            label: "Go to transactions",
            href: "/transactions",
          }}
        />
      ) : filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center">
          <p className="text-sm font-medium text-foreground">
            No filings match your filters
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto sm:mx-0 -mx-4">
          <div className="min-w-[640px] sm:min-w-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                sortable
                sortKey="filingId"
                sortedKey={sortKey}
                sortDirection={sortDirection}
                onSort={(key) => onSort(key as SortKey)}
              >
                Filing ID
              </TableHead>
              <TableHead>Property</TableHead>
              <TableHead
                sortable
                sortKey="status"
                sortedKey={sortKey}
                sortDirection={sortDirection}
                onSort={(key) => onSort(key as SortKey)}
              >
                Status
              </TableHead>
              <TableHead
                sortable
                sortKey="generatedDate"
                sortedKey={sortKey}
                sortDirection={sortDirection}
                onSort={(key) => onSort(key as SortKey)}
              >
                Generated Date
              </TableHead>
              <TableHead>Generated By</TableHead>
              <TableHead className="w-14 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((filing) => {
              const address = filing.transaction
                ? `${filing.transaction.property_address}, ${filing.transaction.property_city}, ${filing.transaction.property_state}`
                : "No transaction";
              const created = toDate(filing.created_at);
              const canMarkFiled = filing.status === "GENERATED";
              const canMarkFiledResult = filing.status === "FILED";
              return (
                <TableRow
                  key={filing.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/transactions/${filing.transaction_id}/filing`)}
                >
                  <TableCell className="font-medium tabular-nums">
                    {getFilingId(filing)}
                  </TableCell>
                  <TableCell className="max-w-[260px]">
                    <Tooltip content={address}>
                      <span className="block truncate">{address}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeClass(filing.status)}>
                      {filing.status === "ACCEPTED" ? (
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden />
                      ) : null}
                      {FILING_STATUS_LABELS[filing.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted">
                    <Tooltip content={created.toLocaleString()}>
                      <span>{formatRelativeDate(created)}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{filing.generated_by || "system"}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="relative inline-flex items-center gap-1">
                      {filing.pdf_url ? (
                        <Link
                          href={`/api/filings/${filing.id}/pdf`}
                          className="inline-flex h-8 items-center rounded-md px-2 text-xs font-medium text-accent hover:bg-blue-50"
                        >
                          Download PDF
                        </Link>
                      ) : (
                        <Tooltip content="No PDF">
                          <span className="inline-flex h-8 items-center rounded-md px-2 text-xs text-muted">
                            Download PDF
                          </span>
                        </Tooltip>
                      )}
                      <button
                        type="button"
                        className={cn(
                          "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-slate-100 hover:text-foreground",
                          menuOpenId === filing.id && "bg-slate-100 text-foreground",
                        )}
                        aria-label="Actions"
                        onClick={() =>
                          setMenuOpenId((current) =>
                            current === filing.id ? null : filing.id,
                          )
                        }
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {menuOpenId === filing.id ? (
                        <>
                          <button
                            type="button"
                            className="fixed inset-0 z-20"
                            aria-label="Close actions"
                            onClick={() => setMenuOpenId(null)}
                          />
                          <ul className="absolute top-full right-0 z-30 mt-1 min-w-[180px] rounded-md border border-slate-200 bg-surface py-1 shadow-md">
                            <li>
                              <Link
                                href={`/transactions/${filing.transaction_id}`}
                                className="block px-3 py-2 text-left text-sm hover:bg-slate-50"
                                onClick={() => setMenuOpenId(null)}
                              >
                                View Transaction
                              </Link>
                            </li>
                            {canMarkFiled ? (
                              <li>
                                <button
                                  type="button"
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 disabled:opacity-60"
                                  disabled={updatingId === filing.id}
                                  onClick={() => updateStatus(filing.id, "FILED")}
                                >
                                  Mark as Filed
                                </button>
                              </li>
                            ) : null}
                            {canMarkFiledResult ? (
                              <>
                                <li>
                                  <button
                                    type="button"
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 disabled:opacity-60"
                                    disabled={updatingId === filing.id}
                                    onClick={() => updateStatus(filing.id, "ACCEPTED")}
                                  >
                                    Mark as Accepted
                                  </button>
                                </li>
                                <li>
                                  <button
                                    type="button"
                                    className="w-full px-3 py-2 text-left text-sm text-danger hover:bg-red-50 disabled:opacity-60"
                                    disabled={updatingId === filing.id}
                                    onClick={() => updateStatus(filing.id, "REJECTED")}
                                  >
                                    Mark as Rejected
                                  </button>
                                </li>
                              </>
                            ) : null}
                          </ul>
                        </>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
          </div>
        </div>
      )}
    </div>
  );
}
