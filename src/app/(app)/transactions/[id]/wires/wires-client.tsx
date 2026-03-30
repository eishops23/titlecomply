"use client";

import { useMemo, useState } from "react";
import { Alert } from "@/components/ui";
import { WireInstructionForm, type WireInput } from "@/components/wires/WireInstructionForm";
import { WireVerification } from "@/components/wires/WireVerification";
import { WireConfirmation } from "@/components/wires/WireConfirmation";
import { getRequiredConfirmations, type WireInstruction } from "@/lib/wire-fraud";

export function WiresClient({ transactionId, initialWires }: { transactionId: string; initialWires: WireInstruction[] }) {
  const [wires, setWires] = useState<WireInstruction[]>(initialWires);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latest = wires[wires.length - 1] ?? null;
  const required = useMemo(() => getRequiredConfirmations(latest?.flags ?? []), [latest]);

  async function submitWire(payload: WireInput) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/transactions/${transactionId}/wires`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to submit wire");
      setWires((prev) => [...prev, body.wire]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit wire");
    } finally {
      setLoading(false);
    }
  }

  async function confirm(method: "in_app" | "phone_callback" | "in_person") {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/transactions/${transactionId}/wires/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to confirm");
      setWires((prev) => [...prev.slice(0, -1), body.wire as WireInstruction]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to confirm");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 p-6">
      {error ? <Alert variant="error">{error}</Alert> : null}
      <WireInstructionForm onSubmit={submitWire} loading={loading} />
      <WireVerification wire={latest} />
      <WireConfirmation wire={latest} requiredCount={required.count} onConfirm={confirm} loading={loading} />
    </div>
  );
}
