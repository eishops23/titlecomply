import { decrypt } from "@/lib/encryption";

export interface ValidationResult {
  valid: boolean;
  score: number;
  checks: ValidationCheck[];
  errors: string[];
  warnings: string[];
}

export interface ValidationCheck {
  id: string;
  category:
    | "property"
    | "transaction"
    | "entity"
    | "trust"
    | "beneficial_owners"
    | "seller"
    | "settlement_agent";
  label: string;
  description: string;
  status: "pass" | "fail" | "warning";
  message?: string;
  field?: string;
  tab?: string;
}

export interface ValidatableTransaction {
  id: string;
  property_address: string;
  property_city: string;
  property_county: string;
  property_state: string;
  property_zip: string;
  purchase_price: number | string | null;
  closing_date: string | Date | null;
  buyer_type: string | null;
  financing_status: string | null;
  screening_result: string | null;
  data_collection: Record<string, unknown> | null;
  entity_detail: {
    entity_name: string;
    entity_type: string;
    formation_state: string | null;
    formation_date: Date | null;
    ein: string | null;
    registered_agent_name: string | null;
    registered_agent_address: string | null;
    principal_place_of_business: string | null;
  } | null;
  trust_detail: {
    trust_name: string;
    trust_type: string | null;
    trust_date: Date | null;
    trustee_name: string | null;
    trustee_address: string | null;
    grantor_name: string | null;
    grantor_address: string | null;
    ein: string | null;
  } | null;
  beneficial_owners: Array<{
    first_name: string;
    last_name: string;
    date_of_birth: string | null;
    ssn_itin: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    ownership_percentage: number;
    id_type: string | null;
    id_number: string | null;
    id_state: string | null;
  }>;
  organization: {
    company_name: string | null;
    company_address: string | null;
    company_city: string | null;
    company_state: string | null;
    company_zip: string | null;
    company_phone: string | null;
    license_number: string | null;
  };
}

function normalizeEncryptedValue(value: string): string {
  try {
    return value.startsWith("enc:") ? decrypt(value) : value;
  } catch {
    return value;
  }
}

function getCollectionObject(
  data: Record<string, unknown> | null,
  key: string,
): Record<string, unknown> {
  const raw = data?.[key];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  return raw as Record<string, unknown>;
}

export function validateTransaction(tx: ValidatableTransaction): ValidationResult {
  const checks: ValidationCheck[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  checks.push({
    id: "property_address",
    category: "property",
    label: "Property Address",
    description: "Complete property address is required",
    status:
      tx.property_address && tx.property_city && tx.property_state && tx.property_zip
        ? "pass"
        : "fail",
    message: !tx.property_address
      ? "Property street address is missing"
      : !tx.property_city
        ? "Property city is missing"
        : !tx.property_state
          ? "Property state is missing"
          : !tx.property_zip
            ? "Property ZIP code is missing"
            : undefined,
    field: "property_address",
    tab: "property",
  });

  checks.push({
    id: "property_county",
    category: "property",
    label: "Property County",
    description: "County is required for FinCEN filing",
    status: tx.property_county ? "pass" : "fail",
    message: !tx.property_county ? "Property county is missing" : undefined,
    field: "property_county",
    tab: "property",
  });

  checks.push({
    id: "purchase_price",
    category: "transaction",
    label: "Purchase Price",
    description: "Purchase price must be provided",
    status: tx.purchase_price && Number(tx.purchase_price) > 0 ? "pass" : "fail",
    message: !tx.purchase_price
      ? "Purchase price is missing"
      : Number(tx.purchase_price) <= 0
        ? "Purchase price must be greater than zero"
        : undefined,
    field: "purchase_price",
    tab: "transaction",
  });

  checks.push({
    id: "closing_date",
    category: "transaction",
    label: "Closing Date",
    description: "Date of closing is required",
    status: tx.closing_date ? "pass" : "fail",
    message: !tx.closing_date ? "Closing date is missing" : undefined,
    field: "closing_date",
    tab: "transaction",
  });

  checks.push({
    id: "buyer_type",
    category: "transaction",
    label: "Buyer Type",
    description: "Buyer type must be specified",
    status: tx.buyer_type ? "pass" : "fail",
    message: !tx.buyer_type ? "Buyer type is missing" : undefined,
    field: "buyer_type",
    tab: "transaction",
  });

  const isEntity =
    tx.buyer_type &&
    ["LLC", "CORPORATION", "PARTNERSHIP", "OTHER_ENTITY"].includes(tx.buyer_type);
  const isTrust = tx.buyer_type === "TRUST";

  if (isEntity) {
    const entity = tx.entity_detail;

    checks.push({
      id: "entity_name",
      category: "entity",
      label: "Entity Legal Name",
      description: "Full legal name of the purchasing entity",
      status: entity?.entity_name ? "pass" : "fail",
      message: !entity?.entity_name ? "Entity legal name is missing" : undefined,
      field: "entity_name",
      tab: "entity",
    });

    checks.push({
      id: "entity_type",
      category: "entity",
      label: "Entity Type",
      description: "LLC, Corporation, or Partnership",
      status: entity?.entity_type ? "pass" : "fail",
      message: !entity?.entity_type ? "Entity type is missing" : undefined,
      field: "entity_type",
      tab: "entity",
    });

    checks.push({
      id: "entity_ein",
      category: "entity",
      label: "Entity EIN",
      description: "Employer Identification Number is required",
      status: entity?.ein ? "pass" : "fail",
      message: !entity?.ein ? "Entity EIN is missing" : undefined,
      field: "ein",
      tab: "entity",
    });

    if (entity?.ein) {
      const einPattern = /^\d{2}-\d{7}$/;
      const decryptedEin = normalizeEncryptedValue(entity.ein);
      checks.push({
        id: "entity_ein_format",
        category: "entity",
        label: "EIN Format",
        description: "EIN must be in XX-XXXXXXX format",
        status: einPattern.test(decryptedEin) ? "pass" : "warning",
        message: einPattern.test(decryptedEin)
          ? undefined
          : "EIN format appears incorrect: expected XX-XXXXXXX",
        field: "ein",
        tab: "entity",
      });
    }

    checks.push({
      id: "entity_formation_state",
      category: "entity",
      label: "Formation State",
      description: "State or country of formation",
      status: entity?.formation_state ? "pass" : "fail",
      message: !entity?.formation_state ? "Formation state is missing" : undefined,
      field: "formation_state",
      tab: "entity",
    });

    checks.push({
      id: "entity_formation_date",
      category: "entity",
      label: "Formation Date",
      description: "Date of entity formation",
      status: entity?.formation_date ? "pass" : "warning",
      message: !entity?.formation_date
        ? "Formation date is missing (recommended but not strictly required)"
        : undefined,
      field: "formation_date",
      tab: "entity",
    });

    checks.push({
      id: "entity_principal_address",
      category: "entity",
      label: "Principal Business Address",
      description: "Principal place of business address",
      status: entity?.principal_place_of_business ? "pass" : "fail",
      message: !entity?.principal_place_of_business
        ? "Principal place of business is missing"
        : undefined,
      field: "principal_place_of_business",
      tab: "entity",
    });
  }

  if (isTrust) {
    const trust = tx.trust_detail;

    checks.push({
      id: "trust_name",
      category: "trust",
      label: "Trust Name",
      description: "Full name of the trust",
      status: trust?.trust_name ? "pass" : "fail",
      message: !trust?.trust_name ? "Trust name is missing" : undefined,
      field: "trust_name",
      tab: "trust",
    });

    checks.push({
      id: "trust_type",
      category: "trust",
      label: "Trust Type",
      description: "Revocable, Irrevocable, Land Trust, or Other",
      status: trust?.trust_type ? "pass" : "fail",
      message: !trust?.trust_type ? "Trust type is missing" : undefined,
      field: "trust_type",
      tab: "trust",
    });

    checks.push({
      id: "trust_ein",
      category: "trust",
      label: "Trust EIN",
      description: "Employer Identification Number for the trust",
      status: trust?.ein ? "pass" : "fail",
      message: !trust?.ein ? "Trust EIN is missing" : undefined,
      field: "ein",
      tab: "trust",
    });

    checks.push({
      id: "trustee",
      category: "trust",
      label: "Trustee Information",
      description: "Trustee name and address required",
      status: trust?.trustee_name && trust?.trustee_address ? "pass" : "fail",
      message: !trust?.trustee_name
        ? "Trustee name is missing"
        : !trust?.trustee_address
          ? "Trustee address is missing"
          : undefined,
      field: "trustee_name",
      tab: "trust",
    });

    checks.push({
      id: "grantor",
      category: "trust",
      label: "Grantor Information",
      description: "Grantor name and address",
      status: trust?.grantor_name ? "pass" : "warning",
      message: !trust?.grantor_name ? "Grantor name is missing (recommended)" : undefined,
      field: "grantor_name",
      tab: "trust",
    });
  }

  checks.push({
    id: "bo_count",
    category: "beneficial_owners",
    label: "Beneficial Owner(s) Present",
    description: "At least one beneficial owner with 25%+ ownership is required",
    status: tx.beneficial_owners.length > 0 ? "pass" : "fail",
    message:
      tx.beneficial_owners.length === 0 ? "No beneficial owners have been added" : undefined,
    tab: "beneficial_owners",
  });

  if (tx.beneficial_owners.length > 0) {
    const totalOwnership = tx.beneficial_owners.reduce(
      (sum, owner) => sum + (owner.ownership_percentage || 0),
      0,
    );
    const has25PlusOwner = tx.beneficial_owners.some(
      (owner) => owner.ownership_percentage >= 25,
    );

    checks.push({
      id: "bo_25_percent",
      category: "beneficial_owners",
      label: "Ownership Threshold Met",
      description: "At least one owner must have 25%+ ownership",
      status: has25PlusOwner ? "pass" : "fail",
      message: !has25PlusOwner
        ? "No beneficial owner has 25% or greater ownership"
        : undefined,
      tab: "beneficial_owners",
    });

    checks.push({
      id: "bo_total_ownership",
      category: "beneficial_owners",
      label: "Ownership Percentages",
      description: "Total ownership should be at least 75%",
      status: totalOwnership >= 75 ? "pass" : totalOwnership > 0 ? "warning" : "fail",
      message:
        totalOwnership < 75
          ? `Total ownership is ${totalOwnership}% — should be at least 75%`
          : undefined,
      tab: "beneficial_owners",
    });

    for (let index = 0; index < tx.beneficial_owners.length; index += 1) {
      const owner = tx.beneficial_owners[index];
      const ownerLabel = `${owner.first_name} ${owner.last_name}`.trim() || `Owner ${index + 1}`;

      checks.push({
        id: `bo_${index}_name`,
        category: "beneficial_owners",
        label: `${ownerLabel} — Name`,
        description: "Full legal name required",
        status: owner.first_name && owner.last_name ? "pass" : "fail",
        message:
          !owner.first_name || !owner.last_name
            ? `Beneficial owner ${index + 1}: full name is incomplete`
            : undefined,
        tab: "beneficial_owners",
      });

      checks.push({
        id: `bo_${index}_dob`,
        category: "beneficial_owners",
        label: `${ownerLabel} — Date of Birth`,
        description: "Date of birth required for FinCEN filing",
        status: owner.date_of_birth ? "pass" : "fail",
        message: !owner.date_of_birth ? `${ownerLabel}: date of birth is missing` : undefined,
        tab: "beneficial_owners",
      });

      checks.push({
        id: `bo_${index}_ssn`,
        category: "beneficial_owners",
        label: `${ownerLabel} — SSN/ITIN`,
        description: "SSN or ITIN required for FinCEN filing",
        status: owner.ssn_itin ? "pass" : "fail",
        message: !owner.ssn_itin ? `${ownerLabel}: SSN/ITIN is missing` : undefined,
        tab: "beneficial_owners",
      });

      checks.push({
        id: `bo_${index}_address`,
        category: "beneficial_owners",
        label: `${ownerLabel} — Residential Address`,
        description: "Full residential address required",
        status: owner.address && owner.city && owner.state && owner.zip ? "pass" : "fail",
        message:
          !owner.address || !owner.city || !owner.state || !owner.zip
            ? `${ownerLabel}: residential address is incomplete`
            : undefined,
        tab: "beneficial_owners",
      });

      checks.push({
        id: `bo_${index}_id`,
        category: "beneficial_owners",
        label: `${ownerLabel} — ID Document`,
        description: "Government-issued ID required",
        status: owner.id_type && owner.id_number ? "pass" : "fail",
        message: !owner.id_type
          ? `${ownerLabel}: ID document type is missing`
          : !owner.id_number
            ? `${ownerLabel}: ID document number is missing`
            : undefined,
        tab: "beneficial_owners",
      });
    }
  }

  const sellerObject = getCollectionObject(tx.data_collection, "seller");
  const sellerName =
    (sellerObject.name as string | undefined) ??
    (tx.data_collection?.seller_name as string | undefined);
  const sellerAddress =
    (sellerObject.address as string | undefined) ??
    (tx.data_collection?.seller_address as string | undefined);

  checks.push({
    id: "seller_name",
    category: "seller",
    label: "Seller Name",
    description: "Transferor name is required",
    status: sellerName ? "pass" : "fail",
    message: !sellerName ? "Seller name is missing" : undefined,
    field: "seller_name",
    tab: "seller",
  });

  checks.push({
    id: "seller_address",
    category: "seller",
    label: "Seller Address",
    description: "Transferor address is required",
    status: sellerAddress ? "pass" : "fail",
    message: !sellerAddress ? "Seller address is missing" : undefined,
    field: "seller_address",
    tab: "seller",
  });

  const org = tx.organization;
  checks.push({
    id: "agent_company",
    category: "settlement_agent",
    label: "Settlement Agent Company",
    description: "Company name required",
    status: org.company_name ? "pass" : "fail",
    message: !org.company_name
      ? "Settlement agent company name is missing — update in Settings"
      : undefined,
    tab: "settlement_agent",
  });

  checks.push({
    id: "agent_address",
    category: "settlement_agent",
    label: "Settlement Agent Address",
    description: "Company address required",
    status:
      org.company_address && org.company_city && org.company_state && org.company_zip
        ? "pass"
        : "fail",
    message:
      !org.company_address || !org.company_city || !org.company_state || !org.company_zip
        ? "Settlement agent address is incomplete — update in Settings"
        : undefined,
    tab: "settlement_agent",
  });

  checks.push({
    id: "agent_license",
    category: "settlement_agent",
    label: "License Number",
    description: "Title agent license number",
    status: org.license_number ? "pass" : "warning",
    message: !org.license_number
      ? "License number is missing — recommended but not strictly required"
      : undefined,
    tab: "settlement_agent",
  });

  checks.push({
    id: "agent_phone",
    category: "settlement_agent",
    label: "Settlement Agent Phone",
    description: "Company phone number",
    status: org.company_phone ? "pass" : "fail",
    message: !org.company_phone
      ? "Settlement agent phone number is missing — update in Settings"
      : undefined,
    tab: "settlement_agent",
  });

  const failChecks = checks.filter((check) => check.status === "fail");
  const warnChecks = checks.filter((check) => check.status === "warning");
  const passChecks = checks.filter((check) => check.status === "pass");
  const score = checks.length > 0 ? Math.round((passChecks.length / checks.length) * 100) : 0;

  for (const check of failChecks) {
    if (check.message) errors.push(check.message);
  }
  for (const check of warnChecks) {
    if (check.message) warnings.push(check.message);
  }

  return {
    valid: failChecks.length === 0,
    score,
    checks,
    errors,
    warnings,
  };
}
