import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reports",
};

export default function ReportsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
      <p className="mt-2 text-muted">Reports will appear here.</p>
    </div>
  );
}
