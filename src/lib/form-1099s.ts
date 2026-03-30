import { decrypt } from "@/lib/encryption";

export interface Form1099SData {
  filerName: string;
  filerEin: string;
  filerAddress: string;
  filerCity: string;
  filerState: string;
  filerZip: string;
  filerPhone: string;
  transferorName: string;
  transferorSsn: string;
  transferorAddress: string;
  transferorCity: string;
  transferorState: string;
  transferorZip: string;
  dateOfClosing: string;
  grossProceeds: number;
  propertyAddress: string;
  propertyDescription: string;
  buyerReceivedProperty: boolean;
  foreignPerson: boolean;
  taxYear: number;
  transactionId: string;
  filingId: string;
  generatedAt: string;
}

export function requires1099S(transaction: {
  purchase_price: number | null;
  status: string;
  closing_date: Date | null;
}): { required: boolean; reason: string } {
  if (!transaction.closing_date) return { required: false, reason: "No closing date set" };
  if (transaction.status === "ARCHIVED" || transaction.status === "SCREENING") {
    return { required: false, reason: "Transaction not closed" };
  }
  const price = Number(transaction.purchase_price) || 0;
  if (price < 600) return { required: false, reason: "Gross proceeds under $600" };
  return { required: true, reason: "Closed real estate transaction with proceeds >= $600" };
}

export function build1099SData(
  transaction: {
    id: string;
    property_address: string;
    property_city: string;
    property_state: string;
    property_zip: string;
    purchase_price: number | string | null;
    closing_date: Date | string | null;
    data_collection: Record<string, unknown> | null;
  },
  organization: {
    name: string;
    company_name: string | null;
    company_address: string | null;
    company_city: string | null;
    company_state: string | null;
    company_zip: string | null;
    company_phone: string | null;
  },
  filerEin: string,
): Form1099SData {
  const dc = transaction.data_collection ?? {};
  const seller = dc.seller && typeof dc.seller === "object" ? (dc.seller as Record<string, unknown>) : {};
  const sellerTaxRaw = (seller.taxId as string | undefined) ?? (dc.seller_ssn_ein as string | undefined);
  let sellerSsn = "***-**-****";
  if (sellerTaxRaw) {
    try {
      const value = sellerTaxRaw.startsWith("enc:") ? decrypt(sellerTaxRaw) : sellerTaxRaw;
      sellerSsn = value;
    } catch {
      sellerSsn = "***-**-****";
    }
  }

  const closing = transaction.closing_date ? new Date(transaction.closing_date) : new Date();
  const taxYear = closing.getFullYear();
  return {
    filerName: organization.company_name || organization.name,
    filerEin,
    filerAddress: organization.company_address || "",
    filerCity: organization.company_city || "",
    filerState: organization.company_state || "",
    filerZip: organization.company_zip || "",
    filerPhone: organization.company_phone || "",
    transferorName: String(seller.name ?? dc.seller_name ?? ""),
    transferorSsn: sellerSsn,
    transferorAddress: String(seller.address ?? dc.seller_address ?? ""),
    transferorCity: "",
    transferorState: "",
    transferorZip: "",
    dateOfClosing: closing.toLocaleDateString("en-US"),
    grossProceeds: Number(transaction.purchase_price) || 0,
    propertyAddress: `${transaction.property_address}, ${transaction.property_city}, ${transaction.property_state} ${transaction.property_zip}`,
    propertyDescription: "Real estate",
    buyerReceivedProperty: true,
    foreignPerson: false,
    taxYear,
    transactionId: transaction.id,
    filingId: `1099S-${taxYear}-${transaction.id.slice(0, 8)}`,
    generatedAt: new Date().toISOString(),
  };
}
