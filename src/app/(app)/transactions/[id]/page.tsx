import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    redirect("/sign-in");
  }

  const { organization } = await resolveUser();
  const { id } = await params;

  const transaction = await prisma.transaction.findFirst({
    where: { id, org_id: organization.id },
    select: {
      id: true,
      file_number: true,
      property_address: true,
      property_city: true,
      property_state: true,
      status: true,
    },
  });

  if (!transaction) {
    notFound();
  }

  const title =
    transaction.file_number?.trim() ||
    transaction.id.slice(0, 8).toUpperCase();

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted">Transaction</p>
          <h1 className="mt-1 text-2xl font-semibold text-foreground">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {transaction.property_address}, {transaction.property_city},{" "}
            {transaction.property_state}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/transactions/${transaction.id}/edit`}
            className="rounded-md border border-slate-200 bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-slate-50"
          >
            Edit
          </Link>
          <Link
            href="/transactions"
            className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:opacity-95"
          >
            Back to list
          </Link>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted">
        Full transaction detail will be expanded in a follow-up.
      </p>
    </div>
  );
}
