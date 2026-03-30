import type { Prisma } from "@/generated/prisma/client";
import type {
  SortKey,
  TransactionsListSearch,
} from "@/lib/transactions-list-params";
import { resolveStatusFilter } from "@/lib/transactions-list-params";

export function buildWhere(
  orgId: string,
  search: TransactionsListSearch,
): Prisma.TransactionWhereInput {
  const statuses = resolveStatusFilter(search);

  const created: Prisma.DateTimeFilter | undefined = {};
  if (search.dateFrom) {
    created.gte = new Date(`${search.dateFrom}T00:00:00.000Z`);
  }
  if (search.dateTo) {
    created.lte = new Date(`${search.dateTo}T23:59:59.999Z`);
  }

  const q = search.q.trim();
  const searchOr: Prisma.TransactionWhereInput[] | undefined = q
    ? [
        {
          OR: [
            { file_number: { contains: q, mode: "insensitive" } },
            { property_address: { contains: q, mode: "insensitive" } },
            { property_city: { contains: q, mode: "insensitive" } },
            {
              entity_detail: {
                entity_name: { contains: q, mode: "insensitive" },
              },
            },
            {
              trust_detail: {
                trust_name: { contains: q, mode: "insensitive" },
              },
            },
          ],
        },
      ]
    : undefined;

  return {
    org_id: orgId,
    ...(statuses ? { status: { in: statuses } } : {}),
    ...(search.buyerType ? { buyer_type: search.buyerType } : {}),
    ...(Object.keys(created).length ? { created_at: created } : {}),
    ...(searchOr ? { AND: searchOr } : {}),
  };
}

export function buildOrderBy(
  sort: SortKey,
  dir: "asc" | "desc",
): Prisma.TransactionOrderByWithRelationInput | Prisma.TransactionOrderByWithRelationInput[] {
  const d = dir;
  switch (sort) {
    case "fileNumber":
      return { file_number: d };
    case "propertyAddress":
      return { property_address: d };
    case "buyerEntity":
      return { entity_detail: { entity_name: d } };
    case "buyerType":
      return { buyer_type: d };
    case "status":
      return { status: d };
    case "closingDate":
      return { closing_date: d };
    case "assignedTo":
      return {
        assigned_to: {
          last_name: d,
        },
      };
    case "createdAt":
    default:
      return { created_at: d };
  }
}
