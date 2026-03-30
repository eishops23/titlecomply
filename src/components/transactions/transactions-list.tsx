"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeftRight,
  ChevronDown,
  MoreVertical,
  Trash2,
  UserPlus,
} from "lucide-react";
import {
  bulkAssignTransactions,
  bulkDeleteTransactions,
  bulkUpdateTransactionStatus,
} from "@/app/(app)/transactions/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TablePagination,
  TableRow,
  type SortDirection,
} from "@/components/ui/table";
import { Tooltip } from "@/components/ui/tooltip";
import { TransactionStatus, type BuyerType } from "@/generated/prisma/enums";
import {
  ALL_TRANSACTION_STATUSES,
  BUYER_TYPE_LABEL,
  STATUS_LABEL,
  statusToBadgeVariant,
} from "@/lib/transactions-labels";
import {
  PAGE_SIZE,
  getEffectiveStatusSelection,
  type SortKey,
  type TransactionsListSearch,
} from "@/lib/transactions-list-params";
import { cn } from "@/lib/utils";

export type TransactionRowDTO = {
  id: string;
  fileLabel: string;
  propertyAddressShort: string;
  propertyAddressFull: string;
  buyerDisplay: string;
  buyerType: BuyerType | null;
  status: TransactionStatus;
  collectionProgress: number;
  closingDateLabel: string | null;
  assignedToLabel: string | null;
  createdRelative: string;
};

type AssigneeOption = { id: string; label: string };

type TransactionsListProps = {
  rows: TransactionRowDTO[];
  totalMatching: number;
  totalInOrg: number;
  search: TransactionsListSearch;
  assignees: AssigneeOption[];
};

function buildQueryFromSearchParams(
  base: URLSearchParams,
  patch: Record<string, string | null | undefined>,
): string {
  const next = new URLSearchParams(base.toString());
  for (const [k, v] of Object.entries(patch)) {
    if (v === null || v === undefined || v === "") {
      next.delete(k);
    } else {
      next.set(k, v);
    }
  }
  const s = next.toString();
  return s ? `?${s}` : "?";
}

export function TransactionsList({
  rows,
  totalMatching,
  totalInOrg,
  search,
  assignees,
}: TransactionsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = React.useTransition();
  const [actionLoading, setActionLoading] = React.useState(false);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null);
  const [bulkStatusOpen, setBulkStatusOpen] = React.useState(false);
  const [bulkAssignOpen, setBulkAssignOpen] = React.useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [bulkStatus, setBulkStatus] = React.useState<TransactionStatus>(
    ALL_TRANSACTION_STATUSES[0],
  );
  const [bulkAssignee, setBulkAssignee] = React.useState<string>("");
  const [searchDraft, setSearchDraft] = React.useState(search.q);
  const searchDebounce = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  React.useEffect(() => {
    setSearchDraft(search.q);
  }, [search.q]);

  React.useEffect(() => {
    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
    };
  }, []);

  React.useEffect(() => {
    setSelected(new Set());
  }, [search.page, searchParams.toString()]);

  const effectiveStatuses = React.useMemo(
    () => getEffectiveStatusSelection(search),
    [search],
  );

  const navigate = React.useCallback(
    (patch: Record<string, string | null | undefined>) => {
      startTransition(() => {
        router.push(
          `/transactions${buildQueryFromSearchParams(searchParams, patch)}`,
        );
      });
    },
    [router, searchParams],
  );

  const onSearchChange = (value: string) => {
    setSearchDraft(value);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      navigate({ q: value.trim() || null, page: "1" });
    }, 350);
  };

  const sortDirection: SortDirection = search.dir === "asc" ? "asc" : "desc";

  const onSort = (key: string) => {
    const k = key as SortKey;
    if (search.sort === k) {
      navigate({
        dir: search.dir === "asc" ? "desc" : "asc",
        page: "1",
      });
    } else {
      const defaultDesc = k === "createdAt" || k === "closingDate";
      navigate({
        sort: k,
        dir: defaultDesc ? "desc" : "asc",
        page: "1",
      });
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalMatching / PAGE_SIZE));

  const onPageChange = (p: number) => {
    navigate({ page: String(p) });
  };

  const clearFilters = () => {
    navigate({
      status: null,
      buyerType: null,
      from: null,
      to: null,
      q: null,
      pipeline: null,
      page: "1",
    });
    setSearchDraft("");
  };

  const hasActiveFilters =
    search.status.length > 0 ||
    search.buyerType != null ||
    search.dateFrom != null ||
    search.dateTo != null ||
    search.q.length > 0 ||
    search.pipeline != null;

  const toggleStatus = (st: TransactionStatus, checked: boolean) => {
    const set = new Set(effectiveStatuses);
    if (checked) set.add(st);
    else set.delete(st);
    let next = [...set];
    if (next.length === 0) {
      next = [...ALL_TRANSACTION_STATUSES];
    }
    const all =
      next.length === ALL_TRANSACTION_STATUSES.length &&
      ALL_TRANSACTION_STATUSES.every((s) => next.includes(s));
    navigate({
      status: all ? null : next.join(","),
      pipeline: null,
      page: "1",
    });
  };

  const selectAllStatuses = () => {
    navigate({ status: null, pipeline: null, page: "1" });
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (checked) n.add(id);
      else n.delete(id);
      return n;
    });
  };

  const pageIds = rows.map((r) => r.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const somePageSelected = pageIds.some((id) => selected.has(id));

  const toggleSelectAllPage = () => {
    if (allPageSelected) {
      setSelected((prev) => {
        const n = new Set(prev);
        for (const id of pageIds) n.delete(id);
        return n;
      });
    } else {
      setSelected((prev) => {
        const n = new Set(prev);
        for (const id of pageIds) n.add(id);
        return n;
      });
    }
  };

  const selectedIds = [...selected];

  const runBulk = async (fn: () => Promise<void>) => {
    setActionLoading(true);
    try {
      await fn();
      setSelected(new Set());
      router.refresh();
    } finally {
      setActionLoading(false);
    }
  };

  const statusSummary =
    effectiveStatuses.length === ALL_TRANSACTION_STATUSES.length
      ? "All statuses"
      : `${effectiveStatuses.length} selected`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3">
        <div className="relative min-w-[200px] flex-1">
          <span className="mb-1 block text-xs font-medium text-foreground">
            Status
          </span>
          <details className="group relative">
            <summary className="flex h-9 cursor-pointer list-none items-center justify-between rounded-md border border-slate-300 bg-surface px-2.5 text-sm text-foreground shadow-sm [&::-webkit-details-marker]:hidden">
              <span className="truncate">{statusSummary}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
            </summary>
            <div className="absolute top-full left-0 z-40 mt-1 max-h-64 min-w-[240px] overflow-y-auto rounded-md border border-slate-200 bg-surface p-2 shadow-md">
              <button
                type="button"
                className="mb-2 w-full rounded px-2 py-1 text-left text-xs text-accent hover:bg-slate-50"
                onClick={selectAllStatuses}
              >
                Select all
              </button>
              <ul className="space-y-1">
                {ALL_TRANSACTION_STATUSES.map((st) => {
                  const on = effectiveStatuses.includes(st);
                  return (
                    <li key={st}>
                      <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={(e) => toggleStatus(st, e.target.checked)}
                          className="rounded border-slate-300"
                        />
                        <span>{STATUS_LABEL[st]}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          </details>
        </div>

        <div className="min-w-[160px] flex-1">
          <Select
            label="Buyer type"
            value={search.buyerType ?? ""}
            options={[
              { value: "", label: "All types" },
              { value: "INDIVIDUAL", label: BUYER_TYPE_LABEL.INDIVIDUAL },
              { value: "LLC", label: BUYER_TYPE_LABEL.LLC },
              { value: "CORPORATION", label: BUYER_TYPE_LABEL.CORPORATION },
              { value: "PARTNERSHIP", label: BUYER_TYPE_LABEL.PARTNERSHIP },
              { value: "TRUST", label: BUYER_TYPE_LABEL.TRUST },
              {
                value: "OTHER_ENTITY",
                label: BUYER_TYPE_LABEL.OTHER_ENTITY,
              },
            ]}
            onChange={(e) =>
              navigate({
                buyerType: e.target.value || null,
                page: "1",
              })
            }
          />
        </div>

        <div className="flex min-w-[200px] flex-1 flex-wrap gap-2">
          <Input
            label="Created from"
            variant="date"
            value={search.dateFrom ?? ""}
            onChange={(e) =>
              navigate({ from: e.target.value || null, page: "1" })
            }
          />
          <Input
            label="Created to"
            variant="date"
            value={search.dateTo ?? ""}
            onChange={(e) =>
              navigate({ to: e.target.value || null, page: "1" })
            }
          />
        </div>

        <div className="min-w-[200px] flex-[2]">
          <Input
            label="Search"
            placeholder="File #, address, entity name…"
            value={searchDraft}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-end gap-2 pb-0.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!hasActiveFilters}
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        </div>
      </div>

      {totalInOrg > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
          <p>
            Showing{" "}
            <span className="font-medium text-foreground tabular-nums">
              {totalMatching === 0 ? 0 : (search.page - 1) * PAGE_SIZE + 1}
              –
              {Math.min(search.page * PAGE_SIZE, totalMatching)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground tabular-nums">
              {totalMatching}
            </span>{" "}
            transactions
          </p>
          {pending ? (
            <span className="text-xs tabular-nums">Updating…</span>
          ) : null}
        </div>
      ) : null}

      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-accent/30 bg-accent/5 px-3 py-2 text-sm">
          <span className="font-medium text-foreground">
            {selectedIds.length} selected
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setBulkStatusOpen(true)}
          >
            Change status
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setBulkAssignOpen(true)}
          >
            <UserPlus className="h-3.5 w-3.5" aria-hidden />
            Assign to
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => setBulkDeleteOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            Delete
          </Button>
        </div>
      ) : null}

      {totalInOrg === 0 ? (
        <EmptyState
          icon={<ArrowLeftRight aria-hidden />}
          title="No transactions yet"
          description="Create your first transaction to start tracking compliance work."
          action={{
            label: "Create your first transaction",
            onClick: () => router.push("/transactions/new"),
          }}
        />
      ) : totalMatching === 0 ? (
        <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center">
          <p className="text-sm font-medium text-foreground">
            No transactions match your filters
          </p>
          <p className="mt-1 text-xs text-muted">
            Try adjusting filters or clear them to see all transactions.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-slate-50">
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    aria-label="Select all on this page"
                    checked={allPageSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = !allPageSelected && somePageSelected;
                    }}
                    onChange={toggleSelectAllPage}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableHead>
                <TableHead
                  sortable
                  sortKey="fileNumber"
                  sortDirection={sortDirection}
                  sortedKey={search.sort}
                  onSort={onSort}
                >
                  File #
                </TableHead>
                <TableHead
                  sortable
                  sortKey="propertyAddress"
                  sortDirection={sortDirection}
                  sortedKey={search.sort}
                  onSort={onSort}
                >
                  Property address
                </TableHead>
                <TableHead
                  sortable
                  sortKey="buyerEntity"
                  sortDirection={sortDirection}
                  sortedKey={search.sort}
                  onSort={onSort}
                >
                  Buyer / entity
                </TableHead>
                <TableHead
                  sortable
                  sortKey="buyerType"
                  sortDirection={sortDirection}
                  sortedKey={search.sort}
                  onSort={onSort}
                >
                  Buyer type
                </TableHead>
                <TableHead
                  sortable
                  sortKey="status"
                  sortDirection={sortDirection}
                  sortedKey={search.sort}
                  onSort={onSort}
                >
                  Status
                </TableHead>
                <TableHead className="min-w-[120px]">Collection</TableHead>
                <TableHead
                  sortable
                  sortKey="closingDate"
                  sortDirection={sortDirection}
                  sortedKey={search.sort}
                  onSort={onSort}
                >
                  Closing date
                </TableHead>
                <TableHead
                  sortable
                  sortKey="assignedTo"
                  sortDirection={sortDirection}
                  sortedKey={search.sort}
                  onSort={onSort}
                >
                  Assigned to
                </TableHead>
                <TableHead
                  sortable
                  sortKey="createdAt"
                  sortDirection={sortDirection}
                  sortedKey={search.sort}
                  onSort={onSort}
                >
                  Created
                </TableHead>
                <TableHead className="w-12 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/transactions/${row.id}`)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={(e) => toggleSelect(row.id, e.target.checked)}
                      aria-label={`Select transaction ${row.fileLabel}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium tabular-nums">
                    {row.fileLabel}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <Tooltip content={row.propertyAddressFull}>
                      <span className="block truncate">
                        {row.propertyAddressShort}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="max-w-[160px]">
                    <span className="line-clamp-2">{row.buyerDisplay}</span>
                  </TableCell>
                  <TableCell>
                    {row.buyerType ? (
                      <Badge variant="screening" className="whitespace-nowrap">
                        {BUYER_TYPE_LABEL[row.buyerType]}
                      </Badge>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusToBadgeVariant(row.status)}>
                      {STATUS_LABEL[row.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {row.status === TransactionStatus.COLLECTING ? (
                      <div className="w-28">
                        <Progress
                          value={row.collectionProgress}
                          showLabel
                        />
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted">
                    {row.closingDateLabel ?? "—"}
                  </TableCell>
                  <TableCell className="max-w-[140px]">
                    <span className="line-clamp-2">
                      {row.assignedToLabel ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted">
                    {row.createdRelative}
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative inline-flex justify-end">
                      <button
                        type="button"
                        className={cn(
                          "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-slate-100 hover:text-foreground",
                          menuOpenId === row.id && "bg-slate-100 text-foreground",
                        )}
                        aria-label="Actions"
                        aria-expanded={menuOpenId === row.id}
                        aria-haspopup="menu"
                        onClick={() =>
                          setMenuOpenId((id) =>
                            id === row.id ? null : row.id,
                          )
                        }
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {menuOpenId === row.id ? (
                        <>
                          <button
                            type="button"
                            className="fixed inset-0 z-30 cursor-default"
                            aria-label="Close menu"
                            onClick={() => setMenuOpenId(null)}
                          />
                          <ul
                            role="menu"
                            className="absolute top-full right-0 z-40 mt-1 min-w-[140px] rounded-md border border-slate-200 bg-surface py-1 shadow-md"
                          >
                            <li>
                              <Link
                                href={`/transactions/${row.id}`}
                                role="menuitem"
                                className="block px-3 py-2 text-left text-sm hover:bg-slate-50"
                                onClick={() => setMenuOpenId(null)}
                              >
                                View
                              </Link>
                            </li>
                            <li>
                              <Link
                                href={`/transactions/${row.id}/edit`}
                                role="menuitem"
                                className="block px-3 py-2 text-left text-sm hover:bg-slate-50"
                                onClick={() => setMenuOpenId(null)}
                              >
                                Edit
                              </Link>
                            </li>
                            <li>
                              <button
                                type="button"
                                role="menuitem"
                                className="w-full px-3 py-2 text-left text-sm text-danger hover:bg-red-50"
                                onClick={() => {
                                  setMenuOpenId(null);
                                  setSelected(new Set([row.id]));
                                  setBulkDeleteOpen(true);
                                }}
                              >
                                Delete
                              </button>
                            </li>
                          </ul>
                        </>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            page={search.page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}

      <Modal
        open={bulkStatusOpen}
        onClose={() => setBulkStatusOpen(false)}
        title="Change status"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setBulkStatusOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              loading={actionLoading}
              onClick={() =>
                runBulk(async () => {
                  await bulkUpdateTransactionStatus(selectedIds, bulkStatus);
                  setBulkStatusOpen(false);
                })
              }
            >
              Apply
            </Button>
          </>
        }
      >
        <Select
          label="New status"
          value={bulkStatus}
          options={ALL_TRANSACTION_STATUSES.map((s) => ({
            value: s,
            label: STATUS_LABEL[s],
          }))}
          onChange={(e) =>
            setBulkStatus(e.target.value as TransactionStatus)
          }
        />
      </Modal>

      <Modal
        open={bulkAssignOpen}
        onClose={() => setBulkAssignOpen(false)}
        title="Assign to"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setBulkAssignOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              loading={actionLoading}
              onClick={() =>
                runBulk(async () => {
                  await bulkAssignTransactions(
                    selectedIds,
                    bulkAssignee || null,
                  );
                  setBulkAssignOpen(false);
                })
              }
            >
              Apply
            </Button>
          </>
        }
      >
        <Select
          label="User"
          placeholder="Unassigned"
          value={bulkAssignee}
          options={assignees.map((a) => ({
            value: a.id,
            label: a.label,
          }))}
          onChange={(e) => setBulkAssignee(e.target.value)}
        />
        <p className="mt-2 text-xs text-muted">
          Choose a team member or leave unassigned to clear assignment.
        </p>
      </Modal>

      <Modal
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        title="Delete transactions?"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setBulkDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={actionLoading}
              onClick={() =>
                runBulk(async () => {
                  await bulkDeleteTransactions(selectedIds);
                  setBulkDeleteOpen(false);
                })
              }
            >
              Delete
            </Button>
          </>
        }
      >
        <p>
          This will permanently delete{" "}
          <strong>{selectedIds.length}</strong> transaction
          {selectedIds.length === 1 ? "" : "s"}. This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
