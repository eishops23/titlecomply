import { describe, it, expect } from "vitest";
import {
  validateTransaction,
  type ValidatableTransaction,
} from "@/lib/validation";

function makeValidTransaction(): ValidatableTransaction {
  return {
    id: "test-id",
    property_address: "123 Ocean Drive",
    property_city: "Boca Raton",
    property_county: "Palm Beach",
    property_state: "FL",
    property_zip: "33432",
    purchase_price: 1_250_000,
    closing_date: new Date("2026-04-10"),
    buyer_type: "LLC",
    financing_status: "NON_FINANCED",
    screening_result: "REQUIRED",
    data_collection: {
      seller_name: "John Smith",
      seller_address: "456 Main St, Miami, FL 33101",
    },
    entity_detail: {
      entity_name: "Oceanview Holdings LLC",
      entity_type: "LLC",
      formation_state: "DE",
      formation_date: new Date("2020-01-15"),
      ein: "12-3456789",
      registered_agent_name: "CT Corporation",
      registered_agent_address: "123 Agent St, Wilmington, DE 19801",
      principal_place_of_business: "789 Business Ave, Boca Raton, FL 33432",
    },
    trust_detail: null,
    beneficial_owners: [
      {
        first_name: "Jane",
        last_name: "Doe",
        date_of_birth: "1985-06-15",
        ssn_itin: "123-45-6789",
        address: "100 Residential Ln",
        city: "Boca Raton",
        state: "FL",
        zip: "33432",
        ownership_percentage: 60,
        id_type: "drivers_license",
        id_number: "D123456",
        id_state: "FL",
      },
      {
        first_name: "Bob",
        last_name: "Smith",
        date_of_birth: "1980-03-20",
        ssn_itin: "987-65-4321",
        address: "200 Another St",
        city: "Miami",
        state: "FL",
        zip: "33101",
        ownership_percentage: 40,
        id_type: "passport",
        id_number: "P987654",
        id_state: "US",
      },
    ],
    organization: {
      company_name: "Sunshine Title & Escrow",
      company_address: "500 Title Blvd",
      company_city: "Boca Raton",
      company_state: "FL",
      company_zip: "33432",
      company_phone: "561-555-0100",
      license_number: "FL-12345",
    },
  };
}

describe("Validation Engine", () => {
  it("should pass validation for a complete transaction", () => {
    const tx = makeValidTransaction();
    const result = validateTransaction(tx);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.score).toBeGreaterThanOrEqual(90);
  });

  it("should fail when property address is missing", () => {
    const tx = makeValidTransaction();
    tx.property_address = "";
    const result = validateTransaction(tx);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes("property"))).toBe(
      true,
    );
  });

  it("should fail when purchase price is missing", () => {
    const tx = makeValidTransaction();
    tx.purchase_price = null;
    const result = validateTransaction(tx);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) => e.toLowerCase().includes("purchase price")),
    ).toBe(true);
  });

  it("should fail when no beneficial owners exist", () => {
    const tx = makeValidTransaction();
    tx.beneficial_owners = [];
    const result = validateTransaction(tx);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) => e.toLowerCase().includes("beneficial owner")),
    ).toBe(true);
  });

  it("should fail when beneficial owner SSN is missing", () => {
    const tx = makeValidTransaction();
    tx.beneficial_owners[0].ssn_itin = null;
    const result = validateTransaction(tx);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes("ssn"))).toBe(true);
  });

  it("should fail when entity detail is missing for LLC buyer", () => {
    const tx = makeValidTransaction();
    tx.entity_detail = null;
    const result = validateTransaction(tx);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes("entity"))).toBe(
      true,
    );
  });

  it("should fail when settlement agent company is missing", () => {
    const tx = makeValidTransaction();
    tx.organization.company_name = null;
    const result = validateTransaction(tx);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) => e.toLowerCase().includes("settlement agent")),
    ).toBe(true);
  });

  it("should warn when total ownership is below 75%", () => {
    const tx = makeValidTransaction();
    tx.beneficial_owners[0].ownership_percentage = 30;
    tx.beneficial_owners[1].ownership_percentage = 20;
    const result = validateTransaction(tx);
    expect(
      result.warnings.some((w) => w.toLowerCase().includes("ownership")),
    ).toBe(true);
  });
});
