"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export type SortDirection = "asc" | "desc" | null;

export type TableProps = React.HTMLAttributes<HTMLTableElement>;

export function Table({ className, ...props }: TableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-md border border-slate-200">
      <table
        className={cn("w-full border-collapse text-left text-sm", className)}
        {...props}
      />
    </div>
  );
}

export type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement>;

export function TableHeader({ className, ...props }: TableHeaderProps) {
  return (
    <thead
      className={cn("border-b border-slate-200 bg-slate-50", className)}
      {...props}
    />
  );
}

export type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>;

export function TableBody({ className, ...props }: TableBodyProps) {
  return <tbody className={cn("divide-y divide-slate-200", className)} {...props} />;
}

export type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>;

export function TableRow({ className, ...props }: TableRowProps) {
  return (
    <tr
      className={cn(
        "bg-surface transition-colors hover:bg-slate-50/80",
        className
      )}
      {...props}
    />
  );
}

export type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement> & {
  sortable?: boolean;
  sortKey?: string;
  sortDirection?: SortDirection;
  sortedKey?: string | null;
  onSort?: (key: string) => void;
};

export function TableHead({
  className,
  sortable,
  sortKey,
  sortDirection,
  sortedKey,
  onSort,
  children,
  ...props
}: TableHeadProps) {
  const active = sortKey != null && sortedKey === sortKey;
  const dir = active ? sortDirection : null;

  if (sortable && sortKey && onSort) {
    return (
      <th
        className={cn(
          "px-3 py-2 text-xs font-semibold tracking-wide text-muted uppercase",
          className
        )}
        {...props}
      >
        <button
          type="button"
          onClick={() => onSort(sortKey)}
          className="inline-flex items-center gap-1 rounded hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        >
          {children}
          {dir === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5 shrink-0" aria-hidden />
          ) : dir === "desc" ? (
            <ArrowDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
          ) : (
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
          )}
        </button>
      </th>
    );
  }

  return (
    <th
      className={cn(
        "px-3 py-2 text-xs font-semibold tracking-wide text-muted uppercase",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>;

export function TableCell({ className, ...props }: TableCellProps) {
  return (
    <td
      className={cn("px-3 py-2 align-middle text-foreground", className)}
      {...props}
    />
  );
}

export type TablePaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function TablePagination({
  page,
  totalPages,
  onPageChange,
  className,
}: TablePaginationProps) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  if (totalPages <= 1) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs text-muted",
        className
      )}
    >
      <span className="tabular-nums">
        Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
