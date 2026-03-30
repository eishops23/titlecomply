"use client";

import { Button, Input } from "@/components/ui";
import type { WireInstruction } from "@/lib/wire-fraud";

export function WireConfirmation({
  wire,
  requiredCount,
  onConfirm,
  loading,
}: {
  wire: WireInstruction | null;
  requiredCount: number;
  onConfirm: (method: "in_app" | "phone_callback" | "in_person", notes?: string) => void;
  loading: boolean;
}) {
  if (!wire) return null;
  const current = wire.confirmations.length;
  return (
    <div className="rounded-md border border-slate-200 p-4">
      <h3 className="text-sm font-semibold">Confirmations</h3>
      <p className="mt-1 text-sm text-muted">
        {current} of {requiredCount} confirmations received
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button loading={loading} variant="secondary" onClick={() => onConfirm("phone_callback")}>
          Confirm via Phone Callback
        </Button>
        <Button loading={loading} variant="secondary" onClick={() => onConfirm("in_app")}>
          Confirm In-App
        </Button>
        <Button loading={loading} variant="secondary" onClick={() => onConfirm("in_person")}>
          Confirm In Person
        </Button>
      </div>
      <Input className="mt-3" label="Notes (optional)" placeholder="Called known number and confirmed routing/account." />
      {wire.verificationStatus === "confirmed" ? (
        <p className="mt-3 text-sm font-semibold text-success">VERIFIED - Safe to Proceed</p>
      ) : null}
    </div>
  );
}
