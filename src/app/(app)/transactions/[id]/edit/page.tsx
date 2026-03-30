import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TransactionEditPage({
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
    select: { id: true, file_number: true },
  });

  if (!transaction) {
    notFound();
  }

  const title =
    transaction.file_number?.trim() ||
    transaction.id.slice(0, 8).toUpperCase();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-foreground">
        Edit transaction — {title}
      </h1>
      <p className="mt-2 max-w-lg text-sm text-muted">
        Editing will be wired to forms in a follow-up. View the transaction
        or return to the list.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={`/transactions/${transaction.id}`}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
        >
          View transaction
        </Link>
        <Link
          href="/transactions"
          className="rounded-md border border-slate-200 bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-slate-50"
        >
          All transactions
        </Link>
      </div>
    </div>
  );
}
