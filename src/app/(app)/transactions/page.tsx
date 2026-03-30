import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  TransactionsList,
  type TransactionRowDTO,
} from "@/components/transactions/transactions-list";
import { resolveUser } from "@/lib/auth";
import { formatRelativeTime } from "@/lib/format-relative";
import { prisma } from "@/lib/db";
import { BuyerType } from "@/generated/prisma/enums";
import { BUYER_TYPE_LABEL } from "@/lib/transactions-labels";
import { buildOrderBy, buildWhere } from "@/lib/transactions-list-query";
import {
  PAGE_SIZE,
  parseTransactionsListSearch,
} from "@/lib/transactions-list-params";

export const dynamic = "force-dynamic";

function truncateAddress(full: string, max = 48): string {
  const t = full.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function buyerDisplayName(
  buyerType: BuyerType | null,
  entityName: string | null,
  trustName: string | null,
): string {
  if (entityName) return entityName;
  if (trustName) return trustName;
  if (buyerType === BuyerType.INDIVIDUAL) return "Individual";
  if (buyerType) return BUYER_TYPE_LABEL[buyerType];
  return "—";
}

function formatUserName(u: {
  first_name: string | null;
  last_name: string | null;
  email: string;
}): string {
  const parts = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
  return parts || u.email;
}

async function TransactionsListLoader({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    redirect("/sign-in");
  }

  const { organization } = await resolveUser();
  const sp = await searchParams;
  const search = parseTransactionsListSearch(sp);

  const where = buildWhere(organization.id, search);
  const orderBy = buildOrderBy(search.sort, search.dir);

  const totalMatching = await prisma.transaction.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalMatching / PAGE_SIZE));
  if (search.page > totalPages) {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (v === undefined) continue;
      if (Array.isArray(v)) {
        for (const item of v) next.append(k, item);
      } else {
        next.set(k, v);
      }
    }
    next.set("page", String(totalPages));
    redirect(`/transactions?${next}`);
  }

  const [totalInOrg, rawRows, assigneeUsers] =
    await prisma.$transaction([
      prisma.transaction.count({
        where: { org_id: organization.id },
      }),
      prisma.transaction.findMany({
        where,
        orderBy,
        skip: (search.page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          file_number: true,
          property_address: true,
          property_city: true,
          property_state: true,
          buyer_type: true,
          status: true,
          collection_progress: true,
          closing_date: true,
          created_at: true,
          entity_detail: { select: { entity_name: true } },
          trust_detail: { select: { trust_name: true } },
          assigned_to: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      }),
      prisma.user.findMany({
        where: { org_id: organization.id },
        orderBy: [{ last_name: "asc" }, { first_name: "asc" }],
        select: { id: true, first_name: true, last_name: true, email: true },
      }),
    ]);

  const rows: TransactionRowDTO[] = rawRows.map((t) => {
    const fullAddress = [
      t.property_address,
      t.property_city,
      t.property_state,
    ]
      .filter(Boolean)
      .join(", ");

    return {
      id: t.id,
      fileLabel: t.file_number?.trim() || t.id.slice(0, 8).toUpperCase(),
      propertyAddressShort: truncateAddress(t.property_address),
      propertyAddressFull: fullAddress,
      buyerDisplay: buyerDisplayName(
        t.buyer_type,
        t.entity_detail?.entity_name ?? null,
        t.trust_detail?.trust_name ?? null,
      ),
      buyerType: t.buyer_type,
      status: t.status,
      collectionProgress: t.collection_progress,
      closingDateLabel: t.closing_date
        ? t.closing_date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : null,
      assignedToLabel: t.assigned_to
        ? formatUserName(t.assigned_to)
        : null,
      createdRelative: formatRelativeTime(t.created_at),
    };
  });

  const assignees = assigneeUsers.map((u) => ({
    id: u.id,
    label: formatUserName(u),
  }));

  return (
    <TransactionsList
      rows={rows}
      totalMatching={totalMatching}
      totalInOrg={totalInOrg}
      search={search}
      assignees={assignees}
    />
  );
}

export default function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Transactions</h1>
        <Link
          href="/transactions/new"
          className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:opacity-95"
        >
          New Transaction
        </Link>
      </div>

      <div className="mt-6">
        <Suspense
          fallback={
            <p className="text-sm text-muted">Loading transactions…</p>
          }
        >
          <TransactionsListLoader searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
