import {
  BuyerType,
  TransactionStatus,
} from "@/generated/prisma/enums";
import {
  PIPELINE_CONFIG,
  parsePipelineParam,
  type PipelineKey,
} from "@/lib/pipeline-config";
import { ALL_TRANSACTION_STATUSES } from "@/lib/transactions-labels";

export const PAGE_SIZE = 20;

export const SORT_KEYS = [
  "fileNumber",
  "propertyAddress",
  "buyerEntity",
  "buyerType",
  "status",
  "closingDate",
  "assignedTo",
  "createdAt",
] as const;

export type SortKey = (typeof SORT_KEYS)[number];

export type TransactionsListSearch = {
  status: TransactionStatus[];
  buyerType: BuyerType | null;
  dateFrom: string | null;
  dateTo: string | null;
  q: string;
  sort: SortKey;
  dir: "asc" | "desc";
  page: number;
  pipeline: PipelineKey | null;
};

function parseStatuses(raw: string | string[] | undefined): TransactionStatus[] {
  if (!raw) return [];
  const s = Array.isArray(raw) ? raw.join(",") : raw;
  const parts = s.split(",").map((p) => p.trim()).filter(Boolean);
  const allowed = new Set(Object.values(TransactionStatus));
  return parts.filter((p): p is TransactionStatus =>
    allowed.has(p as TransactionStatus),
  );
}

function parseBuyerType(raw: string | undefined): BuyerType | null {
  if (!raw) return null;
  const allowed = new Set(Object.values(BuyerType));
  return allowed.has(raw as BuyerType) ? (raw as BuyerType) : null;
}

function parseSort(raw: string | undefined): SortKey {
  if (raw && (SORT_KEYS as readonly string[]).includes(raw)) {
    return raw as SortKey;
  }
  return "createdAt";
}

function parseDir(raw: string | undefined): "asc" | "desc" {
  return raw === "asc" ? "asc" : "desc";
}

function parsePage(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "1", 10);
  if (Number.isNaN(n) || n < 1) return 1;
  return n;
}

export function parseTransactionsListSearch(
  sp: Record<string, string | string[] | undefined>,
): TransactionsListSearch {
  const status = parseStatuses(sp.status);
  const pipeline = parsePipelineParam(
    typeof sp.pipeline === "string" ? sp.pipeline : undefined,
  );
  const buyerType = parseBuyerType(
    typeof sp.buyerType === "string" ? sp.buyerType : undefined,
  );
  const dateFrom =
    typeof sp.from === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.from)
      ? sp.from
      : null;
  const dateTo =
    typeof sp.to === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.to)
      ? sp.to
      : null;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const sort = parseSort(typeof sp.sort === "string" ? sp.sort : undefined);
  const dir = parseDir(typeof sp.dir === "string" ? sp.dir : undefined);
  const page = parsePage(typeof sp.page === "string" ? sp.page : undefined);

  return {
    status,
    buyerType,
    dateFrom,
    dateTo,
    q,
    sort,
    dir,
    page,
    pipeline,
  };
}

export function resolveStatusFilter(
  search: TransactionsListSearch,
): TransactionStatus[] | null {
  if (search.status.length > 0) {
    return search.status;
  }
  if (search.pipeline) {
    return [...PIPELINE_CONFIG[search.pipeline].statuses];
  }
  return null;
}

/** Status checkboxes: explicit filter, pipeline slice, or full list when unfiltered. */
export function getEffectiveStatusSelection(
  search: TransactionsListSearch,
): TransactionStatus[] {
  const resolved = resolveStatusFilter(search);
  if (resolved) return resolved;
  return [...ALL_TRANSACTION_STATUSES];
}
