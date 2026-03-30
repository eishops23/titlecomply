import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { BuyerType } from "@/generated/prisma/enums";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import type { Metadata } from "next";
import { CollectClient } from "./collect-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Collect data",
};

function maskLast4(value: string | null | undefined): string {
  if (!value) return "";
  const plain = decrypt(value);
  return plain.length <= 4 ? plain : plain.slice(-4);
}

export default async function TransactionCollectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    redirect("/sign-in");
  }

  const { organization } = await resolveUser();
  const { id } = await params;

  const transaction = await prisma.transaction.findFirst({
    where: { id, org_id: organization.id },
    include: {
      entity_detail: true,
      trust_detail: true,
      beneficial_owners: true,
    },
  });
  if (!transaction) notFound();

  const dataCollection =
    transaction.data_collection &&
    typeof transaction.data_collection === "object" &&
    !Array.isArray(transaction.data_collection)
      ? (transaction.data_collection as Record<string, unknown>)
      : {};
  const seller =
    dataCollection.seller && typeof dataCollection.seller === "object"
      ? (dataCollection.seller as Record<string, unknown>)
      : {};
  const settlementAgent =
    dataCollection.settlementAgent && typeof dataCollection.settlementAgent === "object"
      ? (dataCollection.settlementAgent as Record<string, unknown>)
      : {};

  return (
    <CollectClient
      transactionId={transaction.id}
      buyerType={transaction.buyer_type ?? BuyerType.INDIVIDUAL}
      initialCollectionProgress={transaction.collection_progress}
      initialEntity={
        transaction.entity_detail
          ? {
              entityName: transaction.entity_detail.entity_name ?? "",
              entityType: transaction.entity_detail.entity_type,
              einLast4: maskLast4(transaction.entity_detail.ein),
              formationState: transaction.entity_detail.formation_state ?? "",
              formationDate: transaction.entity_detail.formation_date
                ? transaction.entity_detail.formation_date.toISOString().slice(0, 10)
                : "",
              registeredAgentName:
                transaction.entity_detail.registered_agent_name ?? "",
              registeredAgentAddress:
                transaction.entity_detail.registered_agent_address ?? "",
              principalPlaceOfBusiness:
                transaction.entity_detail.principal_place_of_business ?? "",
              businessPurpose: transaction.entity_detail.business_purpose ?? "",
            }
          : null
      }
      initialTrust={
        transaction.trust_detail
          ? {
              trustName: transaction.trust_detail.trust_name ?? "",
              trustType: transaction.trust_detail.trust_type ?? "",
              trustDate: transaction.trust_detail.trust_date
                ? transaction.trust_detail.trust_date.toISOString().slice(0, 10)
                : "",
              trusteeName: transaction.trust_detail.trustee_name ?? "",
              trusteeAddress: transaction.trust_detail.trustee_address ?? "",
              grantorName: transaction.trust_detail.grantor_name ?? "",
              grantorAddress: transaction.trust_detail.grantor_address ?? "",
              einLast4: maskLast4(transaction.trust_detail.ein),
            }
          : null
      }
      initialOwners={transaction.beneficial_owners.map((o) => ({
        id: o.id,
        firstName: o.first_name,
        lastName: o.last_name,
        dateOfBirthLast4: maskLast4(o.date_of_birth),
        ssnItinLast4: maskLast4(o.ssn_itin),
        address: o.address ?? "",
        city: o.city ?? "",
        state: o.state ?? "",
        zip: o.zip ?? "",
        country: o.country ?? "US",
        ownershipPercentage: o.ownership_percentage ?? 0,
        idType: o.id_type ?? "",
        idNumberLast4: maskLast4(o.id_number),
        idState: o.id_state ?? "",
        idCountry: o.id_country ?? "",
        idExpiration: o.id_expiration ? o.id_expiration.toISOString().slice(0, 10) : "",
      }))}
      initialSeller={{
        name: String(seller.name ?? ""),
        address: String(seller.address ?? ""),
        taxIdLast4: String(seller.taxId ? maskLast4(String(seller.taxId)) : ""),
      }}
      initialSettlementAgent={{
        companyName:
          String(settlementAgent.companyName ?? "") ||
          organization.company_name ||
          organization.name,
        agentName:
          String(settlementAgent.agentName ?? "") ||
          [organization.name].filter(Boolean).join(" "),
        licenseNumber:
          String(settlementAgent.licenseNumber ?? "") || organization.license_number || "",
        address:
          String(settlementAgent.address ?? "") ||
          [organization.company_address, organization.company_city, organization.company_state]
            .filter(Boolean)
            .join(", "),
        phone: String(settlementAgent.phone ?? "") || organization.company_phone || "",
      }}
    />
  );
}
