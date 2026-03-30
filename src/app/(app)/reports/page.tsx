import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reports",
};

export default function ReportsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
      <p className="mt-2 text-muted">Compliance reports and exports.</p>
      <div className="mt-4">
        <a href="/reports/1099s" className="text-accent hover:underline">
          Open 1099-S Reporting →
        </a>
      </div>
    </div>
  );
}
