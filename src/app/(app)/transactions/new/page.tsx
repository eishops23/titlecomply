"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BuyerType, FinancingStatus, ScreeningResult } from "@/generated/prisma/enums";
import { Alert, Button, Input, Select } from "@/components/ui";
import { toastSuccess } from "@/lib/toast";
import { BUYER_TYPE_LABEL } from "@/lib/transactions-labels";

export const dynamic = "force-dynamic";

type Step = 1 | 2 | 3 | 4;

type FormState = {
  propertyStreet: string;
  propertyCity: string;
  propertyCounty: string;
  propertyState: string;
  propertyZip: string;
  propertyType: string;
  fileNumber: string;
  buyerType: BuyerType;
  entityName: string;
  formationState: string;
  purchasePrice: string;
  closingDate: string;
  financingStatus: FinancingStatus;
};

type ScreenedTransaction = {
  id: string;
  screening_result: ScreeningResult;
  screening_reason: string | null;
  status: string;
};

const steps: Array<{ id: Step; label: string }> = [
  { id: 1, label: "Property Information" },
  { id: 2, label: "Buyer Information" },
  { id: 3, label: "Transaction Details" },
  { id: 4, label: "Screening Result" },
];

const propertyTypeOptions = [
  { value: "single_family", label: "Single family" },
  { value: "condo", label: "Condo" },
  { value: "multi_family", label: "Multi-family" },
  { value: "townhouse", label: "Townhouse" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
];

const financingOptions = [
  {
    value: FinancingStatus.FINANCED,
    label: "Financed (traditional mortgage from regulated lender)",
  },
  {
    value: FinancingStatus.NON_FINANCED,
    label: "Non-financed (cash, wire, crypto)",
  },
  {
    value: FinancingStatus.PARTIAL_FINANCING,
    label: "Partially financed",
  },
  {
    value: FinancingStatus.SELLER_FINANCED,
    label: "Seller-financed",
  },
];

const formationStateOptions = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "Foreign",
].map((s) => ({ value: s, label: s }));

function zipValid(zip: string): boolean {
  return /^\d{5}(?:-\d{4})?$/.test(zip.trim());
}

function resultBannerVariant(result: ScreeningResult): "error" | "success" | "warning" {
  if (result === ScreeningResult.REQUIRED) return "error";
  if (result === ScreeningResult.NOT_REQUIRED) return "success";
  return "warning";
}

export default function NewTransactionPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [screening, setScreening] = useState<ScreenedTransaction | null>(null);
  const [form, setForm] = useState<FormState>({
    propertyStreet: "",
    propertyCity: "",
    propertyCounty: "",
    propertyState: "",
    propertyZip: "",
    propertyType: "single_family",
    fileNumber: "",
    buyerType: BuyerType.INDIVIDUAL,
    entityName: "",
    formationState: "",
    purchasePrice: "",
    closingDate: "",
    financingStatus: FinancingStatus.NON_FINANCED,
  });

  const entityBuyer = form.buyerType !== BuyerType.INDIVIDUAL;
  const stepErrors = useMemo(() => {
    const errors: Partial<Record<keyof FormState, string>> = {};
    if (step === 1) {
      if (!form.propertyStreet.trim()) errors.propertyStreet = "Street is required";
      if (!form.propertyCity.trim()) errors.propertyCity = "City is required";
      if (!form.propertyCounty.trim()) errors.propertyCounty = "County is required";
      if (!form.propertyState.trim()) errors.propertyState = "State is required";
      if (!zipValid(form.propertyZip)) errors.propertyZip = "Enter a valid ZIP code";
      if (!form.propertyType) errors.propertyType = "Property type is required";
    }
    if (step === 2 && entityBuyer) {
      if (!form.entityName.trim()) errors.entityName = "Entity/trust name is required";
      if (!form.formationState.trim()) {
        errors.formationState = "State of formation is required";
      }
    }
    if (step === 3) {
      const price = Number(form.purchasePrice);
      if (!Number.isFinite(price) || price <= 0) {
        errors.purchasePrice = "Purchase price must be greater than 0";
      }
      if (!form.closingDate) errors.closingDate = "Closing date is required";
      if (!form.financingStatus) errors.financingStatus = "Financing status is required";
    }
    return errors;
  }, [entityBuyer, form, step]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function canContinue(): boolean {
    return Object.keys(stepErrors).length === 0;
  }

  function handleNext() {
    if (!canContinue()) return;
    if (step === 2 && !entityBuyer) {
      setStep(3);
      return;
    }
    if (step < 4) setStep((s) => (s + 1) as Step);
  }

  function handleBack() {
    if (step === 1) return;
    if (step === 3 && !entityBuyer) {
      setStep(1);
      return;
    }
    setStep((s) => (s - 1) as Step);
  }

  async function createAndScreen() {
    setSubmitting(true);
    setGlobalError(null);
    try {
      const createResponse = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property: {
            street: form.propertyStreet.trim(),
            city: form.propertyCity.trim(),
            county: form.propertyCounty.trim(),
            state: form.propertyState.trim(),
            zip: form.propertyZip.trim(),
          },
          propertyType: form.propertyType,
          fileNumber: form.fileNumber.trim() || undefined,
          buyerType: form.buyerType,
          entityName: entityBuyer ? form.entityName.trim() : undefined,
          formationState: entityBuyer ? form.formationState.trim() : undefined,
          purchasePrice: Number(form.purchasePrice),
          closingDate: form.closingDate,
          financingStatus: form.financingStatus,
        }),
      });
      const createdBody = (await createResponse.json()) as {
        error?: string;
        transaction?: { id: string };
      };
      if (!createResponse.ok || !createdBody.transaction?.id) {
        throw new Error(createdBody.error ?? "Transaction creation failed");
      }

      const screenResponse = await fetch(
        `/api/transactions/${createdBody.transaction.id}/screen`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );
      const screenBody = (await screenResponse.json()) as {
        error?: string;
        screening?: ScreenedTransaction;
      };
      if (!screenResponse.ok || !screenBody.screening) {
        throw new Error(screenBody.error ?? "Screening failed");
      }

      setScreening(screenBody.screening);
      setStep(4);
      toastSuccess("Transaction created", "Screening complete — review the result below.");
    } catch (error) {
      setGlobalError(
        error instanceof Error ? error.message : "Failed to submit transaction",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function applyScreeningOverride(result: ScreeningResult) {
    if (!screening) return;
    setActionLoading(true);
    setGlobalError(null);
    try {
      const response = await fetch(`/api/transactions/${screening.id}/screen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overrideResult: result,
          overrideReason: "Manual decision selected in wizard step 4",
        }),
      });
      const body = (await response.json()) as {
        error?: string;
        screening?: ScreenedTransaction;
      };
      if (!response.ok || !body.screening) {
        throw new Error(body.error ?? "Failed to update screening result");
      }
      setScreening(body.screening);
    } catch (error) {
      setGlobalError(
        error instanceof Error ? error.message : "Failed to update screening",
      );
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">New transaction</h1>
          <p className="mt-1 text-sm text-muted">
            Intake and screening wizard for FinCEN filing determination.
          </p>
        </div>
        <Link
          href="/transactions"
          className="rounded-md border border-slate-200 bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-slate-50"
        >
          Cancel
        </Link>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-4">
        {steps.map((s) => (
          <div
            key={s.id}
            className={`rounded-md border px-3 py-2 text-xs ${
              s.id === step
                ? "border-accent bg-blue-50 text-blue-900"
                : s.id < step
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-slate-200 bg-surface text-muted"
            }`}
          >
            <p className="font-semibold">Step {s.id}</p>
            <p>{s.label}</p>
          </div>
        ))}
      </div>

      {globalError ? (
        <Alert className="mt-4" variant="error" title="Unable to continue">
          {globalError}
        </Alert>
      ) : null}

      <div className="mt-6 rounded-lg border border-slate-200 bg-surface p-4">
        {step === 1 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Property street address"
              value={form.propertyStreet}
              onChange={(e) => setField("propertyStreet", e.target.value)}
              error={stepErrors.propertyStreet}
            />
            <Input
              label="City"
              value={form.propertyCity}
              onChange={(e) => setField("propertyCity", e.target.value)}
              error={stepErrors.propertyCity}
            />
            <Input
              label="County"
              value={form.propertyCounty}
              onChange={(e) => setField("propertyCounty", e.target.value)}
              error={stepErrors.propertyCounty}
            />
            <Input
              label="State"
              value={form.propertyState}
              onChange={(e) => setField("propertyState", e.target.value)}
              error={stepErrors.propertyState}
            />
            <Input
              label="ZIP code"
              value={form.propertyZip}
              onChange={(e) => setField("propertyZip", e.target.value)}
              error={stepErrors.propertyZip}
            />
            <Select
              label="Property type"
              value={form.propertyType}
              onChange={(e) => setField("propertyType", e.target.value)}
              options={propertyTypeOptions}
            />
            <Input
              label="File / order number (optional)"
              value={form.fileNumber}
              onChange={(e) => setField("fileNumber", e.target.value)}
              className="sm:col-span-2"
            />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label="Buyer type"
              value={form.buyerType}
              onChange={(e) => setField("buyerType", e.target.value as BuyerType)}
              options={Object.values(BuyerType).map((value) => ({
                value,
                label: BUYER_TYPE_LABEL[value],
              }))}
            />
            {entityBuyer ? (
              <>
                <Input
                  label="Entity/trust name"
                  value={form.entityName}
                  onChange={(e) => setField("entityName", e.target.value)}
                  error={stepErrors.entityName}
                />
                <Select
                  label="State of formation"
                  value={form.formationState}
                  onChange={(e) => setField("formationState", e.target.value)}
                  options={formationStateOptions}
                  placeholder="Select formation state"
                  error={stepErrors.formationState}
                />
              </>
            ) : (
              <Alert variant="info" className="sm:col-span-2">
                Buyer is an individual. Entity/trust details are skipped.
              </Alert>
            )}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Purchase price"
              variant="number"
              min="0"
              step="0.01"
              value={form.purchasePrice}
              onChange={(e) => setField("purchasePrice", e.target.value)}
              error={stepErrors.purchasePrice}
            />
            <Input
              label="Closing date"
              variant="date"
              value={form.closingDate}
              onChange={(e) => setField("closingDate", e.target.value)}
              error={stepErrors.closingDate}
            />
            <Select
              label="Financing status"
              value={form.financingStatus}
              onChange={(e) =>
                setField("financingStatus", e.target.value as FinancingStatus)
              }
              options={financingOptions}
              className="sm:col-span-2"
            />
          </div>
        ) : null}

        {step === 4 && screening ? (
          <div className="space-y-4">
            <Alert
              variant={resultBannerVariant(screening.screening_result)}
              title={
                screening.screening_result === ScreeningResult.REQUIRED
                  ? "REQUIRED"
                  : screening.screening_result === ScreeningResult.NOT_REQUIRED
                    ? "NOT REQUIRED"
                    : "NEEDS REVIEW"
              }
            >
              {screening.screening_result === ScreeningResult.REQUIRED ? (
                <p>
                  This transaction requires a FinCEN Real Estate Report filing.
                  Proceed to data collection.
                </p>
              ) : screening.screening_result === ScreeningResult.NOT_REQUIRED ? (
                <p>This transaction does not require a FinCEN filing.</p>
              ) : (
                <p>
                  This transaction may require filing. Manual review is
                  recommended.
                </p>
              )}
            </Alert>

            {screening.screening_reason ? (
              <p className="text-sm text-muted">{screening.screening_reason}</p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {screening.screening_result === ScreeningResult.REQUIRED ? (
                <Button
                  onClick={() => router.push(`/transactions/${screening.id}/collect`)}
                >
                  Start Data Collection →
                </Button>
              ) : null}

              {screening.screening_result === ScreeningResult.NOT_REQUIRED ? (
                <>
                  <Button
                    variant="secondary"
                    loading={actionLoading}
                    onClick={() => router.push("/transactions")}
                  >
                    Archive Transaction
                  </Button>
                  <Button
                    loading={actionLoading}
                    onClick={() => router.push(`/transactions/${screening.id}/collect`)}
                  >
                    Override - Collect Data Anyway
                  </Button>
                </>
              ) : null}

              {screening.screening_result === ScreeningResult.NEEDS_REVIEW ? (
                <>
                  <Button
                    loading={actionLoading}
                    onClick={() => applyScreeningOverride(ScreeningResult.REQUIRED)}
                  >
                    Mark as Required
                  </Button>
                  <Button
                    variant="secondary"
                    loading={actionLoading}
                    onClick={() =>
                      applyScreeningOverride(ScreeningResult.NOT_REQUIRED)
                    }
                  >
                    Mark as Not Required
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <Button variant="secondary" onClick={handleBack} disabled={step === 1 || submitting}>
          Back
        </Button>

        {step < 3 ? (
          <Button onClick={handleNext} disabled={!canContinue()}>
            Continue
          </Button>
        ) : null}

        {step === 3 ? (
          <Button loading={submitting} onClick={createAndScreen} disabled={!canContinue()}>
            Run Screening
          </Button>
        ) : null}
      </div>
    </div>
  );
}
