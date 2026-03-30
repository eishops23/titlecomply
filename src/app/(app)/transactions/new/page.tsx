import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NewTransactionPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-foreground">
        New transaction
      </h1>
      <p className="mt-2 max-w-lg text-sm text-muted">
        Transaction creation will be wired to the data model and forms in a
        follow-up. For now, return to the dashboard or transaction list.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/dashboard"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
        >
          Back to dashboard
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
