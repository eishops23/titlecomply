import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Audit log",
};

export default function AuditLogPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-foreground">Audit log</h1>
      <p className="mt-2 max-w-lg text-sm text-muted">
        Full immutable audit history for your organization will be listed here,
        including exports and hash-chain verification.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex rounded-md text-sm font-medium text-accent hover:underline"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
