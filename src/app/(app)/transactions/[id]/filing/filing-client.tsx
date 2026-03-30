"use client";

import * as React from "react";
import type {
  BeneficialOwner,
  EntityDetail,
  Filing,
  Organization,
  Transaction,
  TrustDetail,
} from "@/generated/prisma/client";
import type { FilingStatus } from "@/generated/prisma/enums";
import type { ValidationResult } from "@/lib/validation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FilingPreview } from "@/components/filings/FilingPreview";
import {
  FilingStatusTracker,
  type FilingPipelineStatus,
} from "@/components/filings/FilingStatusTracker";
import { ValidationPanel } from "@/components/filings/ValidationPanel";

type TransactionWithRelations = Transaction & {
  entity_detail: EntityDetail | null;
  trust_detail: TrustDetail | null;
  beneficial_owners: BeneficialOwner[];
  organization: Organization;
  filings: Filing[];
};

function mapStatus(status: FilingStatus | null, validation: ValidationResult | null): FilingPipelineStatus {
  if (status === "REJECTED") return "REJECTED";
  if (status === "ACCEPTED") return "ACCEPTED";
  if (status === "FILED") return "FILED";
  if (status === "GENERATED") return "GENERATED";
  if (status === "VALIDATED") return "VALIDATED";
  if (validation?.valid) return "VALIDATED";
  return "DRAFT";
}

export function FilingClient({ transaction }: { transaction: TransactionWithRelations }) {
  const existingFiling = transaction.filings[0] ?? null;
  const [validation, setValidation] = React.useState<ValidationResult | null>(
    existingFiling ? { valid: true, score: 100, checks: [], errors: [], warnings: [] } : null,
  );
  const [isValidating, setIsValidating] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [filing, setFiling] = React.useState<Filing | null>(existingFiling);
  const [error, setError] = React.useState<string | null>(null);

  async function runValidation() {
    setError(null);
    setIsValidating(true);
    try {
      const response = await fetch(`/api/transactions/${transaction.id}/validate`, {
        method: "POST",
      });
      const data = (await response.json()) as { validation?: ValidationResult; error?: string };
      if (!response.ok || !data.validation) {
        throw new Error(data.error || "Validation failed");
      }
      setValidation(data.validation);
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : "Validation failed");
    } finally {
      setIsValidating(false);
    }
  }

  async function generateFiling() {
    setError(null);
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/transactions/${transaction.id}/generate-filing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filingType: "initial" }),
      });
      const data = (await response.json()) as { filing?: Filing; error?: string };
      if (!response.ok || !data.filing) {
        throw new Error(data.error || "Filing generation failed");
      }
      setFiling(data.filing);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Filing generation failed");
    } finally {
      setIsGenerating(false);
    }
  }

  const canGenerate = Boolean(validation?.valid) && !filing;
  const pipelineStatus = mapStatus((filing?.status as FilingStatus | undefined) ?? null, validation);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">FinCEN Filing</h1>
        <p className="mt-1 text-sm text-slate-600">
          Validate required fields, generate the report PDF, and download the filing package.
        </p>
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void runValidation()} loading={isValidating} disabled={Boolean(filing)}>
            Validate Transaction
          </Button>
        </div>
        <ValidationPanel result={filing ? validation : validation} isLoading={isValidating} />
      </div>

      {validation?.valid || filing ? (
        <div className="space-y-3">
          <FilingStatusTracker currentStatus={pipelineStatus} />
          {!filing ? (
            <Button onClick={() => void generateFiling()} loading={isGenerating} disabled={!canGenerate}>
              {isGenerating ? "Generating filing report..." : "Generate FinCEN Report"}
            </Button>
          ) : null}
        </div>
      ) : null}

      {filing ? <FilingPreview filing={filing} /> : null}
    </div>
  );
}
