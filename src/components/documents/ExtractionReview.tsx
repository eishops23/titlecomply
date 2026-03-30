"use client";

import * as React from "react";
import type {
  BeneficialOwner,
  EntityDetail,
  TrustDetail,
} from "@/generated/prisma/client";
import type { ExtractionResult } from "@/lib/claude";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface ExtractionReviewProps {
  document: {
    id: string;
    document_type: string;
    extraction_result: ExtractionResult;
    extraction_confidence: number | null;
  };
  currentData: {
    entityDetail?: EntityDetail | null;
    trustDetail?: TrustDetail | null;
    beneficialOwners?: BeneficialOwner[];
  };
  onApply: () => void;
  onClose: () => void;
}

type FieldRow = {
  key: string;
  label: string;
  extracted: string;
  current: string;
  unusual: boolean;
};

function isDateInFuture(value: string): boolean {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() > Date.now();
}

function toRows(props: ExtractionReviewProps): FieldRow[] {
  const result = props.document.extraction_result;
  if (result.type === "entity") {
    return [
      {
        key: "entity_name",
        label: "Entity name",
        extracted: result.data.entity_name ?? "",
        current: props.currentData.entityDetail?.entity_name ?? "",
        unusual: false,
      },
      {
        key: "entity_type",
        label: "Entity type",
        extracted: result.data.entity_type ?? "",
        current: props.currentData.entityDetail?.entity_type ?? "",
        unusual: false,
      },
      {
        key: "formation_state",
        label: "Formation state",
        extracted: result.data.formation_state ?? "",
        current: props.currentData.entityDetail?.formation_state ?? "",
        unusual: false,
      },
      {
        key: "formation_date",
        label: "Formation date",
        extracted: result.data.formation_date ?? "",
        current: props.currentData.entityDetail?.formation_date
          ? props.currentData.entityDetail.formation_date.toISOString().slice(0, 10)
          : "",
        unusual: result.data.formation_date ? isDateInFuture(result.data.formation_date) : false,
      },
      {
        key: "ein",
        label: "EIN",
        extracted: result.data.ein ?? "",
        current: props.currentData.entityDetail?.ein ? "Saved (encrypted)" : "",
        unusual: false,
      },
      {
        key: "registered_agent_name",
        label: "Registered agent name",
        extracted: result.data.registered_agent?.name ?? "",
        current: props.currentData.entityDetail?.registered_agent_name ?? "",
        unusual: false,
      },
      {
        key: "registered_agent_address",
        label: "Registered agent address",
        extracted: result.data.registered_agent?.address ?? "",
        current: props.currentData.entityDetail?.registered_agent_address ?? "",
        unusual: false,
      },
      {
        key: "principal_place_of_business",
        label: "Principal place of business",
        extracted: result.data.principal_place_of_business ?? "",
        current: props.currentData.entityDetail?.principal_place_of_business ?? "",
        unusual: false,
      },
      {
        key: "members",
        label: "Members/owners",
        extracted: String(result.data.members.length),
        current: String(props.currentData.beneficialOwners?.length ?? 0),
        unusual: result.data.members.some(
          (member) => (member.ownership_percentage ?? 0) > 100,
        ),
      },
    ];
  }
  if (result.type === "trust") {
    return [
      {
        key: "trust_name",
        label: "Trust name",
        extracted: result.data.trust_name ?? "",
        current: props.currentData.trustDetail?.trust_name ?? "",
        unusual: false,
      },
      {
        key: "trust_type",
        label: "Trust type",
        extracted: result.data.trust_type ?? "",
        current: props.currentData.trustDetail?.trust_type ?? "",
        unusual: false,
      },
      {
        key: "trust_date",
        label: "Trust date",
        extracted: result.data.trust_date ?? "",
        current: props.currentData.trustDetail?.trust_date
          ? props.currentData.trustDetail.trust_date.toISOString().slice(0, 10)
          : "",
        unusual: result.data.trust_date ? isDateInFuture(result.data.trust_date) : false,
      },
      {
        key: "trustee_name",
        label: "Trustee name",
        extracted: result.data.trustee?.name ?? "",
        current: props.currentData.trustDetail?.trustee_name ?? "",
        unusual: false,
      },
      {
        key: "trustee_address",
        label: "Trustee address",
        extracted: result.data.trustee?.address ?? "",
        current: props.currentData.trustDetail?.trustee_address ?? "",
        unusual: false,
      },
      {
        key: "grantor_name",
        label: "Grantor name",
        extracted: result.data.grantor?.name ?? "",
        current: props.currentData.trustDetail?.grantor_name ?? "",
        unusual: false,
      },
      {
        key: "grantor_address",
        label: "Grantor address",
        extracted: result.data.grantor?.address ?? "",
        current: props.currentData.trustDetail?.grantor_address ?? "",
        unusual: false,
      },
      {
        key: "beneficiaries",
        label: "Beneficiaries",
        extracted: String(result.data.beneficiaries.length),
        current: props.currentData.trustDetail?.beneficiaries ? "Available" : "",
        unusual: result.data.beneficiaries.some((b) => (b.percentage ?? 0) > 100),
      },
      {
        key: "ein",
        label: "EIN",
        extracted: result.data.ein ?? "",
        current: props.currentData.trustDetail?.ein ? "Saved (encrypted)" : "",
        unusual: false,
      },
    ];
  }
  return [];
}

function confidenceStatus(row: FieldRow): "good" | "warn" | "missing" {
  if (!row.extracted) return "missing";
  if (row.unusual) return "warn";
  return "good";
}

export function ExtractionReview(props: ExtractionReviewProps) {
  const [applying, setApplying] = React.useState(false);
  const rows = React.useMemo(() => toRows(props), [props]);

  async function apply(fields?: string[]) {
    setApplying(true);
    try {
      await fetch(`/api/documents/${props.document.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      });
      props.onApply();
    } finally {
      setApplying(false);
    }
  }

  return (
    <Modal
      open
      onClose={props.onClose}
      title="Extraction Review"
      className="max-w-6xl"
      footer={
        <>
          <Button variant="secondary" onClick={props.onClose}>
            Dismiss
          </Button>
          <Button loading={applying} onClick={() => void apply()}>
            Apply All
          </Button>
        </>
      }
    >
      <div className="mb-3 text-sm text-slate-700">
        Overall confidence:{" "}
        <span className="font-semibold">
          {Math.round((props.document.extraction_confidence ?? 0) * 100)}%
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded border border-slate-200 p-3">
          <h3 className="mb-2 text-sm font-semibold">Extracted Data</h3>
          <div className="space-y-2">
            {rows.map((row) => {
              const status = confidenceStatus(row);
              const dotClass =
                status === "good"
                  ? "bg-emerald-500"
                  : status === "warn"
                    ? "bg-amber-500"
                    : "bg-slate-400";
              return (
                <div key={row.key} className="rounded border border-slate-100 p-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{row.label}</p>
                      <p className="text-sm text-slate-900">{row.extracted || "—"}</p>
                    </div>
                    <span className={`mt-1 inline-block h-2.5 w-2.5 rounded-full ${dotClass}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded border border-slate-200 p-3">
          <h3 className="mb-2 text-sm font-semibold">Current Form Values</h3>
          <div className="space-y-2">
            {rows.map((row) => {
              const differs = row.current !== row.extracted;
              const hasNewData = !row.current && Boolean(row.extracted);
              return (
                <div
                  key={row.key}
                  className={`rounded border p-2 ${
                    hasNewData
                      ? "border-emerald-200 bg-emerald-50"
                      : differs
                        ? "border-blue-200 bg-blue-50"
                        : "border-slate-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{row.label}</p>
                      <p className="text-sm text-slate-900">{row.current || "—"}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={!row.extracted || applying}
                      onClick={() => void apply([row.key])}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
