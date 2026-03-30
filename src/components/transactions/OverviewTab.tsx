"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type OverviewTransaction = {
  id: string;
  screening_result: string | null;
  screening_reason: string | null;
  screened_at: string | Date | null;
  collection_progress: number;
  property_address: string;
  property_city: string;
  property_state: string;
  property_zip: string;
  property_county: string;
  purchase_price: unknown;
  closing_date: string | Date | null;
  buyer_type: string | null;
  entity_detail: { entity_name: string; entity_type: string; formation_state: string | null; ein: string | null } | null;
  trust_detail: { trust_name: string; trust_type: string | null; ein: string | null } | null;
  beneficial_owners: Array<{ id: string }>;
  documents: Array<{ id: string; extraction_status: string }>;
  filings: Array<{ id: string; status: string; pdf_url: string | null; created_at: string | Date }>;
  data_collection: unknown;
};

function formatDate(value: string | Date | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatPrice(value: unknown): string {
  if (value === null || value === "") return "—";
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number(
            value && typeof value === "object" && "toString" in value
              ? String((value as { toString: () => string }).toString())
              : NaN,
          );
  if (!Number.isFinite(parsed)) return String(value);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(parsed);
}

function maskEin(value: string | null): string {
  if (!value) return "—";
  const visible = value.slice(-4);
  return `XX-XXX${visible}`;
}

export function OverviewTab({ transaction }: { transaction: OverviewTransaction }) {
  const docsExtracted = transaction.documents.filter((d) => d.extraction_status === "COMPLETED").length;
  const docsPending = transaction.documents.filter((d) =>
    d.extraction_status === "PENDING" || d.extraction_status === "PROCESSING"
  ).length;
  const latestFiling = transaction.filings[0] ?? null;
  const collectionData =
    transaction.data_collection && typeof transaction.data_collection === "object" && !Array.isArray(transaction.data_collection)
      ? (transaction.data_collection as Record<string, unknown>)
      : {};
  const sellerData =
    collectionData.seller && typeof collectionData.seller === "object"
      ? (collectionData.seller as Record<string, unknown>)
      : null;
  const sellerComplete = Boolean(sellerData?.name) && Boolean(sellerData?.address);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Screening Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            Result:{" "}
            <Badge
              variant={
                transaction.screening_result === "REQUIRED"
                  ? "rejected"
                  : transaction.screening_result === "NOT_REQUIRED"
                    ? "filed"
                    : "validating"
              }
            >
              {transaction.screening_result ?? "Not screened"}
            </Badge>
          </p>
          <p className="text-muted">{transaction.screening_reason ?? "No screening reason available."}</p>
          <p className="text-xs text-muted">Screened: {formatDate(transaction.screened_at)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Collection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={transaction.collection_progress} />
          <p>Entity/Trust: {transaction.entity_detail || transaction.trust_detail ? "Complete" : "Incomplete"}</p>
          <p>Owners: {transaction.beneficial_owners.length} collected</p>
          <p>Seller: {sellerComplete ? "Complete" : "Incomplete"}</p>
          <Link href={`/transactions/${transaction.id}/collect`} className="text-accent hover:underline">
            Continue →
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p>{transaction.property_address}</p>
          <p>
            {transaction.property_city}, {transaction.property_state} {transaction.property_zip}
          </p>
          <p>{transaction.property_county} County</p>
          <p>Purchase: {formatPrice(transaction.purchase_price)}</p>
          <p>Closing: {formatDate(transaction.closing_date)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Buyer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {transaction.entity_detail ? (
            <>
              <p>{transaction.entity_detail.entity_name}</p>
              <p>
                {transaction.entity_detail.entity_type}
                {transaction.entity_detail.formation_state ? ` (${transaction.entity_detail.formation_state})` : ""}
              </p>
              <p>EIN: {maskEin(transaction.entity_detail.ein)}</p>
            </>
          ) : transaction.trust_detail ? (
            <>
              <p>{transaction.trust_detail.trust_name}</p>
              <p>{transaction.trust_detail.trust_type ?? "Trust"}</p>
              <p>EIN: {maskEin(transaction.trust_detail.ein)}</p>
            </>
          ) : (
            <p className="text-muted">Buyer details not collected yet.</p>
          )}
          <p>{transaction.beneficial_owners.length} Beneficial Owners</p>
          <Link href={`/transactions/${transaction.id}/collect`} className="text-accent hover:underline">
            View Details →
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p>{transaction.documents.length} documents uploaded</p>
          <p>{docsExtracted} extracted</p>
          <p>{docsPending} pending</p>
          <Link href={`/transactions/${transaction.id}/documents`} className="text-accent hover:underline">
            Manage Docs →
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Filing Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {latestFiling ? (
            <>
              <p>Status: {latestFiling.status}</p>
              <p>Filing ID: {latestFiling.id.slice(0, 8).toUpperCase()}</p>
              <p>Generated: {formatDate(latestFiling.created_at)}</p>
              {latestFiling.pdf_url ? (
                <a href={latestFiling.pdf_url} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                  Download PDF
                </a>
              ) : null}
            </>
          ) : (
            <p className="text-muted">No filing yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
