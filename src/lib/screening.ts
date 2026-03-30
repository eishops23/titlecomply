import {
  FinancingStatus,
  ScreeningResult,
  type BuyerType,
} from "@/generated/prisma/enums";

export type PropertyType =
  | "single_family"
  | "condo"
  | "multi_family"
  | "townhouse"
  | "land"
  | "commercial";

export type ScreeningInput = {
  propertyType: PropertyType;
  buyerType: BuyerType;
  financingStatus: FinancingStatus;
  purchasePrice?: number | null;
  isTransferForConsideration?: boolean;
  formationState?: string | null;
};

export type ScreeningOutput = {
  result: ScreeningResult;
  reason: string;
};

const RESIDENTIAL_PROPERTY_TYPES: PropertyType[] = [
  "single_family",
  "condo",
  "multi_family",
  "townhouse",
];

export function runScreening(input: ScreeningInput): ScreeningOutput {
  const isResidential = RESIDENTIAL_PROPERTY_TYPES.includes(input.propertyType);
  if (!isResidential) {
    return {
      result: ScreeningResult.NOT_REQUIRED,
      reason:
        "This appears to be a non-residential transfer. Commercial/non-residential transfers are exempt from filing in the current rule scope.",
    };
  }

  if (input.buyerType === "INDIVIDUAL") {
    return {
      result: ScreeningResult.NOT_REQUIRED,
      reason:
        "The buyer is an individual person, not a legal entity or trust, so this transaction is not reportable.",
    };
  }

  if (input.financingStatus === FinancingStatus.FINANCED) {
    return {
      result: ScreeningResult.NOT_REQUIRED,
      reason:
        "The transaction is financed by a regulated lender, which is generally exempt from this FinCEN filing requirement.",
    };
  }

  if (
    input.financingStatus === FinancingStatus.PARTIAL_FINANCING ||
    input.financingStatus === FinancingStatus.SELLER_FINANCED
  ) {
    return {
      result: ScreeningResult.NEEDS_REVIEW,
      reason:
        "Partial or seller financing is an edge case that can require manual compliance review.",
    };
  }

  const isConsideration =
    input.isTransferForConsideration ??
    (typeof input.purchasePrice === "number" && input.purchasePrice > 0);
  if (!isConsideration) {
    return {
      result: ScreeningResult.NEEDS_REVIEW,
      reason:
        "The transfer may not be for consideration (for example gift/inheritance/court order), which needs manual review.",
    };
  }

  if (input.formationState === "Foreign") {
    return {
      result: ScreeningResult.NEEDS_REVIEW,
      reason:
        "Foreign entity buyers are flagged as an edge case and should be manually reviewed before filing determination.",
    };
  }

  return {
    result: ScreeningResult.REQUIRED,
    reason:
      "Residential transfer to an entity/trust without full regulated financing appears reportable under the FinCEN screening rule.",
  };
}
