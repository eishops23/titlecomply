import type { Form1099SData } from "@/lib/form-1099s";

export function Form1099SPreview({ data }: { data: Form1099SData | null }) {
  if (!data) return <p className="text-sm text-muted">Select a transaction to preview 1099-S data.</p>;
  return (
    <div className="rounded-md border border-slate-200 p-4 text-sm">
      <p className="font-semibold">Form 1099-S Preview</p>
      <p>Filing ID: {data.filingId}</p>
      <p>Transferor: {data.transferorName}</p>
      <p>Property: {data.propertyAddress}</p>
      <p>Gross Proceeds: ${data.grossProceeds.toLocaleString("en-US")}</p>
      <p>Date of Closing: {data.dateOfClosing}</p>
    </div>
  );
}
