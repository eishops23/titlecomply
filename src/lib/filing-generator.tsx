import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { decrypt } from "@/lib/encryption";

export interface FilingData {
  filing_type: "initial" | "corrected" | "amended";
  filing_date: string;
  filing_id: string;
  property: {
    address: string;
    city: string;
    county: string;
    state: string;
    zip: string;
  };
  closing_date: string;
  purchase_price: string;
  property_type: string;
  transferee: {
    name: string;
    entity_type: string;
    ein: string;
    formation_state: string;
    formation_date: string;
    principal_address: string;
  };
  beneficial_owners: Array<{
    full_name: string;
    date_of_birth: string;
    ssn_itin: string;
    address: string;
    id_type: string;
    id_number: string;
    id_jurisdiction: string;
  }>;
  seller: {
    name: string;
    address: string;
    ssn_ein: string;
  };
  settlement_agent: {
    company_name: string;
    agent_name: string;
    license_number: string;
    address: string;
    phone: string;
  };
  organization_name: string;
  generated_by: string;
  generated_at: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#0F172A",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#64748B",
    marginBottom: 2,
  },
  partHeader: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    backgroundColor: "#1E3A5F",
    color: "#FFFFFF",
    padding: 6,
    marginTop: 12,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
    paddingVertical: 2,
  },
  label: {
    width: "40%",
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  value: {
    width: "60%",
    fontSize: 9,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#CBD5E1",
    marginVertical: 6,
  },
  ownerSection: {
    marginBottom: 10,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#2563EB",
  },
  ownerTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    color: "#1E3A5F",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 7,
    color: "#94A3B8",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 8,
  },
  disclaimer: {
    fontSize: 7,
    color: "#94A3B8",
    marginTop: 16,
    fontStyle: "italic",
  },
});

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "—"}</Text>
    </View>
  );
}

function FinCENReport({ data }: { data: FilingData }) {
  const purchasePrice = Number(data.purchase_price || 0);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>FinCEN Real Estate Report</Text>
          <Text style={styles.subtitle}>31 CFR Part 1031 — Non-Financed Real Estate Transfer</Text>
          <Text style={styles.subtitle}>Filing ID: {data.filing_id}</Text>
        </View>

        <Text style={styles.partHeader}>Part I — Filing Information</Text>
        <FieldRow
          label="Type of Filing"
          value={data.filing_type.charAt(0).toUpperCase() + data.filing_type.slice(1)}
        />
        <FieldRow label="Filing Date" value={data.filing_date} />

        <Text style={styles.partHeader}>Part II — Transaction Information</Text>
        <FieldRow
          label="Property Address"
          value={`${data.property.address}, ${data.property.city}, ${data.property.state} ${data.property.zip}`}
        />
        <FieldRow label="County" value={data.property.county} />
        <FieldRow label="Date of Closing" value={data.closing_date} />
        <FieldRow
          label="Purchase Price"
          value={`$${purchasePrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
        />
        <FieldRow label="Property Type" value={data.property_type} />

        <Text style={styles.partHeader}>Part III — Transferee (Buyer) Information</Text>
        <FieldRow label="Entity/Trust Name" value={data.transferee.name} />
        <FieldRow label="Entity Type" value={data.transferee.entity_type} />
        <FieldRow label="EIN" value={data.transferee.ein} />
        <FieldRow label="Formation State" value={data.transferee.formation_state} />
        <FieldRow label="Formation Date" value={data.transferee.formation_date} />
        <FieldRow label="Principal Address" value={data.transferee.principal_address} />

        <Text style={styles.partHeader}>Part IV — Beneficial Ownership Information</Text>
        {data.beneficial_owners.map((owner, index) => (
          <View key={`owner-${index}`} style={styles.ownerSection}>
            <Text style={styles.ownerTitle}>Beneficial Owner {index + 1}</Text>
            <FieldRow label="Full Legal Name" value={owner.full_name} />
            <FieldRow label="Date of Birth" value={owner.date_of_birth} />
            <FieldRow label="SSN/ITIN" value={owner.ssn_itin} />
            <FieldRow label="Residential Address" value={owner.address} />
            <FieldRow label="ID Document Type" value={owner.id_type} />
            <FieldRow label="ID Number" value={owner.id_number} />
            <FieldRow label="Issuing Jurisdiction" value={owner.id_jurisdiction} />
            {index < data.beneficial_owners.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}

        <Text style={styles.partHeader}>Part V — Transferor (Seller) Information</Text>
        <FieldRow label="Name" value={data.seller.name} />
        <FieldRow label="Address" value={data.seller.address} />
        <FieldRow label="SSN/EIN" value={data.seller.ssn_ein} />

        <Text style={styles.partHeader}>Part VI — Settlement Agent Information</Text>
        <FieldRow label="Company Name" value={data.settlement_agent.company_name} />
        <FieldRow label="Agent Name" value={data.settlement_agent.agent_name} />
        <FieldRow label="License Number" value={data.settlement_agent.license_number} />
        <FieldRow label="Address" value={data.settlement_agent.address} />
        <FieldRow label="Phone" value={data.settlement_agent.phone} />

        <Text style={styles.disclaimer}>
          This document was generated by TitleComply for {data.organization_name}. Generated on{" "}
          {data.generated_at} by {data.generated_by}. This is not a FinCEN submission - it is a
          compliance report for record-keeping. Submit the official filing through FinCEN&apos;s BSA
          E-Filing System.
        </Text>

        <View style={styles.footer}>
          <Text>
            TitleComply — FinCEN Compliance Automation | titlecomply.com | Filing ID:{" "}
            {data.filing_id}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateFilingPdf(data: FilingData): Promise<Buffer> {
  const buffer = await renderToBuffer(<FinCENReport data={data} />);
  return Buffer.from(buffer);
}

type BuildTransaction = {
  id: string;
  property_address: string;
  property_city: string;
  property_county: string;
  property_state: string;
  property_zip: string;
  purchase_price: number | string | null;
  closing_date: string | Date | null;
  buyer_type: string | null;
  data_collection: Record<string, unknown> | null;
  entity_detail: {
    entity_name: string;
    entity_type: string;
    formation_state: string | null;
    formation_date: Date | null;
    ein: string | null;
    principal_place_of_business: string | null;
  } | null;
  trust_detail: {
    trust_name: string;
    trust_type: string | null;
    trust_date: Date | null;
    trustee_name: string | null;
    trustee_address: string | null;
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
    id_country: string | null;
  }>;
  organization: {
    name: string;
    company_name: string | null;
    company_address: string | null;
    company_city: string | null;
    company_state: string | null;
    company_zip: string | null;
    company_phone: string | null;
    license_number: string | null;
  };
};

function decryptValue(value: string | null): string {
  if (!value) return "—";
  try {
    return value.startsWith("enc:") ? decrypt(value) : value;
  } catch {
    return "***";
  }
}

function maskSsn(value: string | null): string {
  if (!value) return "—";
  const raw = decryptValue(value);
  if (raw === "***") return "***";
  return raw.length >= 4 ? `XXX-XX-${raw.slice(-4)}` : "***";
}

function maskId(value: string | null): string {
  if (!value) return "—";
  const raw = decryptValue(value);
  if (raw === "***") return "***";
  return raw.length >= 4 ? `***${raw.slice(-4)}` : "***";
}

function formatDate(value: string | Date | null): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function buildFilingData(
  transaction: BuildTransaction,
  filingId: string,
  generatedBy: string,
  filingType: "initial" | "corrected" | "amended" = "initial",
): FilingData {
  const dataCollection = transaction.data_collection ?? {};
  const sellerSection =
    dataCollection.seller && typeof dataCollection.seller === "object"
      ? (dataCollection.seller as Record<string, unknown>)
      : {};
  const settlementAgentSection =
    dataCollection.settlementAgent && typeof dataCollection.settlementAgent === "object"
      ? (dataCollection.settlementAgent as Record<string, unknown>)
      : {};
  const screeningSection =
    dataCollection.screening && typeof dataCollection.screening === "object"
      ? (dataCollection.screening as Record<string, unknown>)
      : {};

  const isTrust = transaction.buyer_type === "TRUST";
  const entity = transaction.entity_detail;
  const trust = transaction.trust_detail;
  const org = transaction.organization;
  const agentAddress = [org.company_address, org.company_city, org.company_state, org.company_zip]
    .filter(Boolean)
    .join(", ");

  return {
    filing_type: filingType,
    filing_date: formatDate(new Date()),
    filing_id: filingId,
    property: {
      address: transaction.property_address,
      city: transaction.property_city,
      county: transaction.property_county,
      state: transaction.property_state,
      zip: transaction.property_zip,
    },
    closing_date: formatDate(transaction.closing_date),
    purchase_price: String(transaction.purchase_price || 0),
    property_type: String(screeningSection.property_type ?? "Residential"),
    transferee: isTrust
      ? {
          name: trust?.trust_name || "—",
          entity_type: `Trust (${trust?.trust_type || "Unknown"})`,
          ein: maskSsn(trust?.ein || null),
          formation_state: "—",
          formation_date: formatDate(trust?.trust_date || null),
          principal_address: trust?.trustee_address || "—",
        }
      : {
          name: entity?.entity_name || "—",
          entity_type: entity?.entity_type || "—",
          ein: maskSsn(entity?.ein || null),
          formation_state: entity?.formation_state || "—",
          formation_date: formatDate(entity?.formation_date || null),
          principal_address: entity?.principal_place_of_business || "—",
        },
    beneficial_owners: transaction.beneficial_owners.map((owner) => ({
      full_name: `${owner.first_name} ${owner.last_name}`.trim() || "—",
      date_of_birth: formatDate(owner.date_of_birth),
      ssn_itin: maskSsn(owner.ssn_itin),
      address: [owner.address, owner.city, owner.state, owner.zip].filter(Boolean).join(", ") || "—",
      id_type: owner.id_type || "—",
      id_number: maskId(owner.id_number),
      id_jurisdiction: owner.id_state || owner.id_country || "—",
    })),
    seller: {
      name:
        String(sellerSection.name ?? "") ||
        String(dataCollection.seller_name ?? "") ||
        "—",
      address:
        String(sellerSection.address ?? "") ||
        String(dataCollection.seller_address ?? "") ||
        "—",
      ssn_ein: maskSsn(
        (sellerSection.taxId as string | undefined) ||
          (dataCollection.seller_ssn_ein as string | undefined) ||
          null,
      ),
    },
    settlement_agent: {
      company_name: org.company_name || "—",
      agent_name:
        (settlementAgentSection.agentName as string | undefined) ||
        org.name ||
        "—",
      license_number: org.license_number || "—",
      address:
        (settlementAgentSection.address as string | undefined) || agentAddress || "—",
      phone:
        (settlementAgentSection.phone as string | undefined) ||
        org.company_phone ||
        "—",
    },
    organization_name: org.name,
    generated_by: generatedBy,
    generated_at: new Date().toISOString(),
  };
}
