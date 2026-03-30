import { describe, it, expect } from "vitest";
import { runScreening } from "@/lib/screening";
import {
  BuyerType,
  FinancingStatus,
  ScreeningResult,
} from "@/generated/prisma/enums";

const residentialBase = {
  propertyType: "single_family" as const,
  purchasePrice: 750_000,
  isTransferForConsideration: true,
};

describe("Screening Engine", () => {
  it("should return REQUIRED for non-financed LLC purchase", () => {
    const out = runScreening({
      ...residentialBase,
      buyerType: BuyerType.LLC,
      financingStatus: FinancingStatus.NON_FINANCED,
    });
    expect(out.result).toBe(ScreeningResult.REQUIRED);
  });

  it("should return REQUIRED for non-financed trust purchase", () => {
    const out = runScreening({
      ...residentialBase,
      buyerType: BuyerType.TRUST,
      financingStatus: FinancingStatus.NON_FINANCED,
    });
    expect(out.result).toBe(ScreeningResult.REQUIRED);
  });

  it("should return REQUIRED for non-financed corporation purchase", () => {
    const out = runScreening({
      ...residentialBase,
      buyerType: BuyerType.CORPORATION,
      financingStatus: FinancingStatus.NON_FINANCED,
    });
    expect(out.result).toBe(ScreeningResult.REQUIRED);
  });

  it("should return NOT_REQUIRED for individual buyer", () => {
    const out = runScreening({
      ...residentialBase,
      buyerType: BuyerType.INDIVIDUAL,
      financingStatus: FinancingStatus.NON_FINANCED,
    });
    expect(out.result).toBe(ScreeningResult.NOT_REQUIRED);
  });

  it("should return NOT_REQUIRED for financed entity purchase", () => {
    const out = runScreening({
      ...residentialBase,
      buyerType: BuyerType.LLC,
      financingStatus: FinancingStatus.FINANCED,
    });
    expect(out.result).toBe(ScreeningResult.NOT_REQUIRED);
  });

  it("should return NEEDS_REVIEW for seller-financed entity purchase", () => {
    const out = runScreening({
      ...residentialBase,
      buyerType: BuyerType.LLC,
      financingStatus: FinancingStatus.SELLER_FINANCED,
    });
    expect(out.result).toBe(ScreeningResult.NEEDS_REVIEW);
  });

  it("should return NEEDS_REVIEW for partially financed entity purchase", () => {
    const out = runScreening({
      ...residentialBase,
      buyerType: BuyerType.LLC,
      financingStatus: FinancingStatus.PARTIAL_FINANCING,
    });
    expect(out.result).toBe(ScreeningResult.NEEDS_REVIEW);
  });
});
