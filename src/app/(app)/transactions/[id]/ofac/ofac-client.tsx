"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { OfacResults } from "@/components/ofac/OfacResults";
import { OfacCertificate } from "@/components/ofac/OfacCertificate";
import type { OfacScreeningResult } from "@/lib/ofac";

export function OfacClient({
  transactionId,
  initialResult,
}: {
  transactionId: string;
  initialResult: OfacScreeningResult | null;
}) {
  const [result, setResult] = useState<OfacScreeningResult | null>(initialResult);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runScreening() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/transactions/${transactionId}/ofac-screen`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Screening failed");
      setResult(body.screening as OfacScreeningResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to run screening");
    } finally {
      setLoading(false);
    }
  }

  function downloadCertificate() {
    if (!result) return;
    const lines = [
      "OFAC Compliance Certificate",
      `Certificate ID: ${result.certificateId}`,
      `Screened At: ${result.screenedAt}`,
      `Overall Status: ${result.overallStatus}`,
      ...result.parties.map((p) => `${p.partyRole}: ${p.partyName} - ${p.status}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${result.certificateId}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={runScreening} loading={loading}>
          {result ? "Re-Screen" : "Run OFAC Screening"}
        </Button>
        {result?.overallStatus === "MATCH" ? (
          <p className="text-sm font-semibold text-danger">DO NOT PROCEED - OFAC MATCH DETECTED</p>
        ) : null}
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <OfacResults result={result} />
      <OfacCertificate result={result} onDownload={downloadCertificate} />
    </div>
  );
}
