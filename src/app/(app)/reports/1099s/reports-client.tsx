"use client";

import { useMemo, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Select, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";

type Row = {
  transactionId: string;
  property: string;
  seller: string;
  closingDate: string | Date | null;
  grossProceeds: number;
  required: boolean;
  reason: string;
  generated: boolean;
};

export function Reports1099SClient({
  initialRows,
  initialYear,
  canGenerate,
}: {
  initialRows: Row[];
  initialYear: number;
  canGenerate: boolean;
}) {
  const [year, setYear] = useState(String(initialYear));
  const [rows, setRows] = useState(initialRows);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const summary = useMemo(() => {
    const eligible = rows.filter((r) => r.required);
    const generated = eligible.filter((r) => r.generated);
    return {
      eligible: eligible.length,
      generated: generated.length,
      pending: eligible.length - generated.length,
      gross: eligible.reduce((sum, r) => sum + r.grossProceeds, 0),
    };
  }, [rows]);

  async function generate(transactionId: string) {
    setLoadingId(transactionId);
    const res = await fetch("/api/reports/1099s/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId }),
    });
    setLoadingId(null);
    if (res.ok) {
      setRows((prev) => prev.map((r) => (r.transactionId === transactionId ? { ...r, generated: true } : r)));
    }
  }

  async function loadYear(nextYear: string) {
    setYear(nextYear);
    const res = await fetch(`/api/reports/1099s?year=${nextYear}`);
    const body = await res.json();
    if (res.ok) setRows(body.rows as Row[]);
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-foreground">1099-S Reporting</h1>
        <Select
          value={year}
          onChange={(e) => loadYear(e.target.value)}
          options={[
            { value: String(new Date().getFullYear()), label: String(new Date().getFullYear()) },
            { value: String(new Date().getFullYear() - 1), label: String(new Date().getFullYear() - 1) },
          ]}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader><CardTitle>Total Eligible</CardTitle></CardHeader><CardContent>{summary.eligible}</CardContent></Card>
        <Card><CardHeader><CardTitle>Generated</CardTitle></CardHeader><CardContent>{summary.generated}</CardContent></Card>
        <Card><CardHeader><CardTitle>Pending</CardTitle></CardHeader><CardContent>{summary.pending}</CardContent></Card>
        <Card><CardHeader><CardTitle>Total Gross Proceeds</CardTitle></CardHeader><CardContent>${summary.gross.toLocaleString("en-US")}</CardContent></Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => fetch("/api/reports/1099s/batch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ year: Number(year) }) })}>Generate All Pending</Button>
        <a href={`/api/reports/1099s/export?year=${year}`}><Button variant="secondary">Export CSV</Button></a>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead>Closing Date</TableHead>
            <TableHead>Gross Proceeds</TableHead>
            <TableHead>1099-S Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.transactionId}>
              <TableCell>{row.property}</TableCell>
              <TableCell>{row.seller || "—"}</TableCell>
              <TableCell>{row.closingDate ? new Date(row.closingDate).toLocaleDateString("en-US") : "—"}</TableCell>
              <TableCell>${row.grossProceeds.toLocaleString("en-US")}</TableCell>
              <TableCell>{row.required ? (row.generated ? "Generated" : "Pending") : "N/A"}</TableCell>
              <TableCell>
                {row.required ? (
                  canGenerate ? (
                    <Button size="sm" loading={loadingId === row.transactionId} onClick={() => generate(row.transactionId)}>
                      {row.generated ? "Re-Generate" : "Generate"}
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary">Upgrade to Generate</Button>
                  )
                ) : (
                  <span className="text-xs text-muted">{row.reason}</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
