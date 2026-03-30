"use client";

import { useState } from "react";
import { Button, Input, Select } from "@/components/ui";

export type WireInput = {
  partyRole: "buyer" | "seller" | "lender" | "settlement_agent";
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  accountName: string;
  bankAddress: string;
  swiftCode?: string;
  reference: string;
  amount: number;
};

export function WireInstructionForm({
  onSubmit,
  loading,
}: {
  onSubmit: (value: WireInput) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<WireInput>({
    partyRole: "seller",
    bankName: "",
    routingNumber: "",
    accountNumber: "",
    accountName: "",
    bankAddress: "",
    swiftCode: "",
    reference: "",
    amount: 0,
  });
  return (
    <div className="rounded-md border border-slate-200 p-4">
      <h3 className="mb-3 text-sm font-semibold">Wire Instructions</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label="Party Role"
          value={form.partyRole}
          onChange={(e) => setForm((p) => ({ ...p, partyRole: e.target.value as WireInput["partyRole"] }))}
          options={[
            { value: "buyer", label: "Buyer" },
            { value: "seller", label: "Seller" },
            { value: "lender", label: "Lender" },
            { value: "settlement_agent", label: "Settlement Agent" },
          ]}
        />
        <Input label="Bank Name" value={form.bankName} onChange={(e) => setForm((p) => ({ ...p, bankName: e.target.value }))} />
        <Input label="Routing Number" value={form.routingNumber} onChange={(e) => setForm((p) => ({ ...p, routingNumber: e.target.value }))} />
        <Input label="Account Number" value={form.accountNumber} onChange={(e) => setForm((p) => ({ ...p, accountNumber: e.target.value }))} />
        <Input label="Account Name" value={form.accountName} onChange={(e) => setForm((p) => ({ ...p, accountName: e.target.value }))} />
        <Input label="Bank Address" value={form.bankAddress} onChange={(e) => setForm((p) => ({ ...p, bankAddress: e.target.value }))} />
        <Input label="SWIFT Code" value={form.swiftCode} onChange={(e) => setForm((p) => ({ ...p, swiftCode: e.target.value }))} />
        <Input label="Reference" value={form.reference} onChange={(e) => setForm((p) => ({ ...p, reference: e.target.value }))} />
        <Input label="Amount" variant="number" value={String(form.amount || "")} onChange={(e) => setForm((p) => ({ ...p, amount: Number(e.target.value || 0) }))} />
      </div>
      <Button className="mt-3" loading={loading} onClick={() => onSubmit(form)}>
        Submit & Verify
      </Button>
    </div>
  );
}
