import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";

function createSeedClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 60_000,
    idleTimeoutMillis: 30_000,
  });
  const adapter = new PrismaPg(pool);
  return { prisma: new PrismaClient({ adapter }), pool };
}

async function main() {
  const { prisma, pool } = createSeedClient();

  try {
    await prisma.alert.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.reminder.deleteMany();
    await prisma.document.deleteMany();
    await prisma.filing.deleteMany();
    await prisma.beneficialOwner.deleteMany();
    await prisma.entityDetail.deleteMany();
    await prisma.trustDetail.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organization.deleteMany();

    const org = await prisma.organization.create({
      data: {
        clerk_org_id: "org_seed_sunshine_title_escrow",
        name: "Sunshine Title & Escrow, LLC",
        plan: "STARTER",
        company_name: "Sunshine Title & Escrow, LLC",
        company_address: "1200 Brickell Ave",
        company_city: "Miami",
        company_state: "FL",
        company_zip: "33131",
        company_phone: "(305) 555-0142",
        company_email: "compliance@sunshinetitle-demo.com",
        license_number: "W123456",
        underwriter: "First American Title Insurance Company",
        default_reminder_days: 3,
        auto_screen: true,
        monthly_transaction_limit: 25,
        monthly_transaction_count: 8,
        limit_reset_at: new Date("2026-04-01T00:00:00.000Z"),
      },
    });

    const jon = await prisma.user.create({
      data: {
        clerk_user_id: "user_seed_jon_admin",
        org_id: org.id,
        email: "jon.martinez@sunshinetitle-demo.com",
        first_name: "Jon",
        last_name: "Martinez",
        role: "ADMIN",
      },
    });

    const sarah = await prisma.user.create({
      data: {
        clerk_user_id: "user_seed_sarah_closer",
        org_id: org.id,
        email: "sarah.chen@sunshinetitle-demo.com",
        first_name: "Sarah",
        last_name: "Chen",
        role: "CLOSER",
      },
    });

    const mike = await prisma.user.create({
      data: {
        clerk_user_id: "user_seed_mike_processor",
        org_id: org.id,
        email: "mike.rivera@sunshinetitle-demo.com",
        first_name: "Mike",
        last_name: "Rivera",
        role: "PROCESSOR",
      },
    });

    const baseTx = {
      org_id: org.id,
      created_by_id: jon.id,
    };

    const tx1 = await prisma.transaction.create({
      data: {
        ...baseTx,
        assigned_to_id: sarah.id,
        file_number: "ST-2026-0142",
        status: "SCREENING",
        property_address: "1850 NW Spanish River Blvd",
        property_city: "Boca Raton",
        property_county: "Palm Beach",
        property_state: "FL",
        property_zip: "33431",
        purchase_price: new Prisma.Decimal("875000.00"),
        closing_date: new Date("2026-04-18T17:00:00.000Z"),
        buyer_type: "INDIVIDUAL",
        financing_status: "FINANCED",
        screening_result: "NEEDS_REVIEW",
        screening_reason: "Awaiting county recorder confirmation on prior deed.",
        notes: "Cash-adjacent financing; lender package pending.",
      },
    });

    const tx2 = await prisma.transaction.create({
      data: {
        ...baseTx,
        assigned_to_id: mike.id,
        file_number: "ST-2026-0143",
        status: "SCREENING",
        property_address: "333 Las Olas Way Unit 2104",
        property_city: "Fort Lauderdale",
        property_county: "Broward",
        property_state: "FL",
        property_zip: "33301",
        purchase_price: new Prisma.Decimal("1125000.00"),
        closing_date: new Date("2026-04-22T17:00:00.000Z"),
        buyer_type: "LLC",
        financing_status: "NON_FINANCED",
        screening_result: "REQUIRED",
        screening_reason: "Entity purchaser; CTA screening in progress.",
      },
    });

    const tx3 = await prisma.transaction.create({
      data: {
        ...baseTx,
        assigned_to_id: sarah.id,
        file_number: "ST-2026-0144",
        status: "COLLECTING",
        property_address: "4525 Collins Ave Apt 9B",
        property_city: "Miami Beach",
        property_county: "Miami-Dade",
        property_state: "FL",
        property_zip: "33140",
        purchase_price: new Prisma.Decimal("2450000.00"),
        closing_date: new Date("2026-05-02T17:00:00.000Z"),
        buyer_type: "LLC",
        financing_status: "FINANCED",
        screening_result: "REQUIRED",
        screened_at: new Date("2026-03-15T14:22:00.000Z"),
        data_collection: {
          completed: ["entity_name", "formation_state"],
          pending: ["ein", "operating_agreement", "beneficial_owner_ids"],
          last_updated_by: "mike.rivera@sunshinetitle-demo.com",
          notes: "CPA forwarding EIN letter next week.",
        },
        collection_progress: 0.42,
        notes: "High-value oceanfront; expedite BO collection.",
      },
    });

    const tx4 = await prisma.transaction.create({
      data: {
        ...baseTx,
        assigned_to_id: mike.id,
        file_number: "ST-2026-0145",
        status: "COLLECTING",
        property_address: "2701 Anderson Rd",
        property_city: "Coral Gables",
        property_county: "Miami-Dade",
        property_state: "FL",
        property_zip: "33134",
        purchase_price: new Prisma.Decimal("1895000.00"),
        closing_date: new Date("2026-04-28T17:00:00.000Z"),
        buyer_type: "LLC",
        financing_status: "PARTIAL_FINANCING",
        screening_result: "REQUIRED",
        screened_at: new Date("2026-03-18T09:05:00.000Z"),
        data_collection: {
          completed: ["entity_name", "registered_agent"],
          pending: ["beneficial_ownership_chart", "wire_instructions_match"],
          notes: "Operating agreement draft under partner review.",
        },
        collection_progress: 0.58,
      },
    });

    const tx5 = await prisma.transaction.create({
      data: {
        ...baseTx,
        assigned_to_id: jon.id,
        file_number: "ST-2026-0146",
        status: "VALIDATING",
        property_address: "100 S Pointe Dr Unit 3501",
        property_city: "Miami Beach",
        property_county: "Miami-Dade",
        property_state: "FL",
        property_zip: "33139",
        purchase_price: new Prisma.Decimal("5200000.00"),
        closing_date: new Date("2026-05-09T17:00:00.000Z"),
        buyer_type: "LLC",
        financing_status: "FINANCED",
        screening_result: "REQUIRED",
        screened_at: new Date("2026-03-20T11:40:00.000Z"),
        data_collection: {
          status: "complete_pending_validation",
          submitted_at: "2026-03-25T16:00:00.000Z",
        },
        collection_progress: 1,
      },
    });

    const tx6 = await prisma.transaction.create({
      data: {
        ...baseTx,
        assigned_to_id: sarah.id,
        file_number: "ST-2026-0147",
        status: "READY_TO_FILE",
        property_address: "701 S Olive Ave",
        property_city: "Boca Raton",
        property_county: "Palm Beach",
        property_state: "FL",
        property_zip: "33486",
        purchase_price: new Prisma.Decimal("725000.00"),
        closing_date: new Date("2026-04-12T17:00:00.000Z"),
        buyer_type: "LLC",
        financing_status: "NON_FINANCED",
        screening_result: "REQUIRED",
        screened_at: new Date("2026-03-10T10:00:00.000Z"),
        collection_progress: 1,
      },
    });

    const tx7 = await prisma.transaction.create({
      data: {
        ...baseTx,
        assigned_to_id: sarah.id,
        file_number: "ST-2026-0148",
        status: "FILED",
        property_address: "2100 N Ocean Blvd",
        property_city: "Fort Lauderdale",
        property_county: "Broward",
        property_state: "FL",
        property_zip: "33305",
        purchase_price: new Prisma.Decimal("3350000.00"),
        closing_date: new Date("2026-03-28T17:00:00.000Z"),
        buyer_type: "TRUST",
        financing_status: "FINANCED",
        screening_result: "REQUIRED",
        screened_at: new Date("2026-03-01T08:30:00.000Z"),
        collection_progress: 1,
      },
    });

    const tx8 = await prisma.transaction.create({
      data: {
        ...baseTx,
        assigned_to_id: mike.id,
        file_number: "ST-2026-0149",
        status: "NO_FILING_REQUIRED",
        property_address: "1500 Ocean Dr Unit 8C",
        property_city: "Miami Beach",
        property_county: "Miami-Dade",
        property_state: "FL",
        property_zip: "33139",
        purchase_price: new Prisma.Decimal("980000.00"),
        closing_date: new Date("2026-04-05T17:00:00.000Z"),
        buyer_type: "INDIVIDUAL",
        financing_status: "FINANCED",
        screening_result: "NOT_REQUIRED",
        screened_at: new Date("2026-03-22T13:15:00.000Z"),
        screening_reason: "Individual natural-person buyer; no reporting entity.",
        collection_progress: 1,
      },
    });

    await prisma.entityDetail.create({
      data: {
        transaction_id: tx3.id,
        entity_name: "Oceanview Holdings LLC",
        entity_type: "LLC",
        formation_state: "FL",
        formation_country: "US",
        formation_date: new Date("2019-06-12T00:00:00.000Z"),
        ein: "XX-XXXXXXX",
        state_registration_number: "L19000089234",
        registered_agent_name: "Florida Registered Agents Inc.",
        registered_agent_address: "100 SE 2nd St, Miami, FL 33131",
        principal_place_of_business: "Miami Beach, FL",
        business_purpose: "Real estate investment and holding company.",
      },
    });

    await prisma.beneficialOwner.createMany({
      data: [
        {
          transaction_id: tx3.id,
          first_name: "Elena",
          last_name: "Vasquez",
          date_of_birth: "1982-04-21",
          ownership_percentage: 55,
          ownership_type: "Membership interest",
          address: "4525 Collins Ave Apt 9B",
          city: "Miami Beach",
          state: "FL",
          zip: "33140",
          country: "US",
          id_type: "drivers_license",
          id_state: "FL",
          verified: false,
        },
        {
          transaction_id: tx3.id,
          first_name: "Marcus",
          last_name: "Okonkwo",
          date_of_birth: "1979-11-03",
          ownership_percentage: 45,
          ownership_type: "Membership interest",
          address: "88 SW 7th St",
          city: "Miami",
          state: "FL",
          zip: "33130",
          country: "US",
          verified: false,
        },
      ],
    });

    await prisma.entityDetail.create({
      data: {
        transaction_id: tx4.id,
        entity_name: "Palm Capital Group LLC",
        entity_type: "LLC",
        formation_state: "DE",
        formation_country: "US",
        formation_date: new Date("2017-03-01T00:00:00.000Z"),
        ein: "XX-XXXXXXX",
        state_registration_number: "M17000000456",
        registered_agent_name: "Corporation Service Company",
        registered_agent_address: "2711 Centerville Rd, Wilmington, DE 19808",
        principal_place_of_business: "Coral Gables, FL",
        business_purpose: "Acquisition and disposition of residential real estate.",
      },
    });

    await prisma.beneficialOwner.createMany({
      data: [
        {
          transaction_id: tx4.id,
          first_name: "Danielle",
          last_name: "Brooks",
          date_of_birth: "1988-07-14",
          ownership_percentage: 60,
          ownership_type: "Managing member",
          city: "Coral Gables",
          state: "FL",
          zip: "33134",
          country: "US",
          verified: false,
        },
        {
          transaction_id: tx4.id,
          first_name: "James",
          last_name: "Brooks",
          date_of_birth: "1986-02-28",
          ownership_percentage: 40,
          ownership_type: "Member",
          city: "Coral Gables",
          state: "FL",
          zip: "33134",
          country: "US",
          verified: false,
        },
      ],
    });

    await prisma.entityDetail.create({
      data: {
        transaction_id: tx5.id,
        entity_name: "Bay Harbor Commerce LLC",
        entity_type: "LLC",
        formation_state: "FL",
        formation_country: "US",
        formation_date: new Date("2021-01-15T00:00:00.000Z"),
        ein: "XX-XXXXXXX",
        state_registration_number: "L21000044102",
        registered_agent_name: "Sunshine Registered Agent LLC",
        registered_agent_address: "200 S Biscayne Blvd, Miami, FL 33131",
        principal_place_of_business: "Miami Beach, FL",
        business_purpose: "Luxury condominium acquisitions.",
      },
    });

    await prisma.beneficialOwner.createMany({
      data: [
        {
          transaction_id: tx5.id,
          first_name: "Sofia",
          last_name: "Reyes",
          date_of_birth: "1990-05-09",
          ownership_percentage: 50,
          ownership_type: "Membership interest",
          address: "100 S Pointe Dr Unit 3501",
          city: "Miami Beach",
          state: "FL",
          zip: "33139",
          country: "US",
          id_type: "passport",
          id_country: "US",
          verified: true,
          verified_by: jon.id,
          verified_at: new Date("2026-03-26T10:00:00.000Z"),
        },
        {
          transaction_id: tx5.id,
          first_name: "Thomas",
          last_name: "Reyes",
          date_of_birth: "1987-12-19",
          ownership_percentage: 50,
          ownership_type: "Membership interest",
          address: "100 S Pointe Dr Unit 3501",
          city: "Miami Beach",
          state: "FL",
          zip: "33139",
          country: "US",
          verified: true,
          verified_by: jon.id,
          verified_at: new Date("2026-03-26T10:05:00.000Z"),
        },
      ],
    });

    await prisma.entityDetail.create({
      data: {
        transaction_id: tx6.id,
        entity_name: "Atlantic Realty Partners LLC",
        entity_type: "LLC",
        formation_state: "FL",
        formation_country: "US",
        formation_date: new Date("2015-09-20T00:00:00.000Z"),
        ein: "XX-XXXXXXX",
        state_registration_number: "L15000077890",
        registered_agent_name: "National Registered Agents, Inc.",
        principal_place_of_business: "Boca Raton, FL",
        business_purpose: "Residential property investment.",
      },
    });

    await prisma.beneficialOwner.createMany({
      data: [
        {
          transaction_id: tx6.id,
          first_name: "Patricia",
          last_name: "Nguyen",
          date_of_birth: "1975-03-02",
          ownership_percentage: 100,
          ownership_type: "Sole member",
          address: "701 S Olive Ave",
          city: "Boca Raton",
          state: "FL",
          zip: "33486",
          country: "US",
          verified: true,
          verified_by: sarah.id,
          verified_at: new Date("2026-03-27T14:20:00.000Z"),
        },
      ],
    });

    await prisma.trustDetail.create({
      data: {
        transaction_id: tx7.id,
        trust_name: "Sunshine Investments Trust",
        trust_date: new Date("2018-11-01T00:00:00.000Z"),
        trust_type: "Irrevocable grantor trust",
        trustee_name: "Coastal Fiduciary Services LLC",
        trustee_address: "100 E Broward Blvd, Fort Lauderdale, FL 33301",
        grantor_name: "Robert K. Langford",
        grantor_address: "2100 N Ocean Blvd, Fort Lauderdale, FL 33305",
        beneficiaries: [
          { name: "Robert K. Langford Jr.", share: "residuary" },
          { name: "Charitable Foundation A", share: "10%" },
        ],
        ein: "XX-XXXXXXX",
      },
    });

    await prisma.beneficialOwner.createMany({
      data: [
        {
          transaction_id: tx7.id,
          first_name: "Robert",
          last_name: "Langford",
          date_of_birth: "1955-08-17",
          ownership_percentage: 100,
          ownership_type: "Trust beneficial interest (disclosed)",
          city: "Fort Lauderdale",
          state: "FL",
          zip: "33305",
          country: "US",
          verified: true,
          verified_by: jon.id,
          verified_at: new Date("2026-03-15T09:00:00.000Z"),
        },
      ],
    });

    const filingPayload = {
      report_type: "REAL_ESTATE_REPORT",
      version: "2026.1",
      property: { state: "FL", county_sample: true },
    };

    await prisma.filing.create({
      data: {
        org_id: org.id,
        transaction_id: tx6.id,
        filing_data: { ...filingPayload, stage: "draft", internal_ref: tx6.file_number },
        filing_type: "REAL_ESTATE_REPORT",
        status: "DRAFT",
        generated_by: jon.id,
      },
    });

    await prisma.filing.create({
      data: {
        org_id: org.id,
        transaction_id: tx5.id,
        filing_data: { ...filingPayload, stage: "validated", internal_ref: tx5.file_number },
        filing_type: "REAL_ESTATE_REPORT",
        status: "VALIDATED",
        validated_at: new Date("2026-03-27T11:30:00.000Z"),
        generated_by: jon.id,
      },
    });

    await prisma.filing.create({
      data: {
        org_id: org.id,
        transaction_id: tx4.id,
        filing_data: { ...filingPayload, stage: "generated_pdf", internal_ref: tx4.file_number },
        filing_type: "REAL_ESTATE_REPORT",
        status: "GENERATED",
        pdf_url: "https://storage.demo.titlecomply/filings/ST-2026-0145-preview.pdf",
        generated_by: sarah.id,
      },
    });

    const hash = (n: number) =>
      `sha256:seed${n.toString().padStart(4, "0")}a`.padEnd(64, "0").slice(0, 64);

    await prisma.auditLog.createMany({
      data: [
        {
          org_id: org.id,
          user_id: jon.id,
          transaction_id: null,
          action: "ORG_SETTINGS_VIEW",
          details: { section: "compliance_defaults" },
          ip_address: "10.0.1.12",
          user_agent: "TitleComply-Web/1.0",
          previous_hash: null,
          current_hash: hash(1),
        },
        {
          org_id: org.id,
          user_id: sarah.id,
          transaction_id: tx1.id,
          action: "TRANSACTION_CREATED",
          details: { file_number: tx1.file_number },
          ip_address: "10.0.2.44",
          user_agent: "TitleComply-Web/1.0",
          previous_hash: hash(1),
          current_hash: hash(2),
        },
        {
          org_id: org.id,
          user_id: mike.id,
          transaction_id: tx3.id,
          action: "DATA_COLLECTION_UPDATED",
          details: { progress: 0.42 },
          ip_address: "10.0.2.88",
          user_agent: "TitleComply-Web/1.0",
          previous_hash: hash(2),
          current_hash: hash(3),
        },
        {
          org_id: org.id,
          user_id: sarah.id,
          transaction_id: tx5.id,
          action: "FILING_VALIDATION_STARTED",
          details: { filing_status_target: "VALIDATED" },
          ip_address: "10.0.2.44",
          user_agent: "TitleComply-Web/1.0",
          previous_hash: hash(3),
          current_hash: hash(4),
        },
        {
          org_id: org.id,
          user_id: jon.id,
          transaction_id: tx5.id,
          action: "BENEFICIAL_OWNER_VERIFIED",
          details: { count: 2 },
          ip_address: "10.0.1.12",
          user_agent: "TitleComply-Web/1.0",
          previous_hash: hash(4),
          current_hash: hash(5),
        },
        {
          org_id: org.id,
          user_id: sarah.id,
          transaction_id: tx7.id,
          action: "TRANSACTION_FILED_EXTERNALLY",
          details: { reference: "FIN-2026-FTL-8891" },
          ip_address: "10.0.2.44",
          user_agent: "TitleComply-Web/1.0",
          previous_hash: hash(5),
          current_hash: hash(6),
        },
        {
          org_id: org.id,
          user_id: mike.id,
          transaction_id: tx8.id,
          action: "SCREENING_COMPLETED",
          details: { result: "NOT_REQUIRED" },
          ip_address: "10.0.2.88",
          user_agent: "TitleComply-Web/1.0",
          previous_hash: hash(6),
          current_hash: hash(7),
        },
        {
          org_id: org.id,
          user_id: jon.id,
          transaction_id: null,
          action: "USER_ROLE_REVIEW",
          details: { reviewed: "processor_quota" },
          ip_address: "10.0.1.12",
          user_agent: "TitleComply-Web/1.0",
          previous_hash: hash(7),
          current_hash: hash(8),
        },
        {
          org_id: org.id,
          user_id: sarah.id,
          transaction_id: tx6.id,
          action: "FILING_DRAFT_SAVED",
          details: { filing_type: "REAL_ESTATE_REPORT" },
          ip_address: "10.0.2.44",
          user_agent: "TitleComply-Web/1.0",
          previous_hash: hash(8),
          current_hash: hash(9),
        },
        {
          org_id: org.id,
          user_id: mike.id,
          transaction_id: tx4.id,
          action: "DOCUMENT_UPLOADED",
          details: { document_type: "OPERATING_AGREEMENT", file_name: "PCG_OA_draft.pdf" },
          ip_address: "10.0.2.88",
          user_agent: "TitleComply-Web/1.0",
          previous_hash: hash(9),
          current_hash: hash(10),
        },
      ],
    });

    await prisma.alert.createMany({
      data: [
        {
          org_id: org.id,
          transaction_id: tx6.id,
          type: "OVERDUE_FILING",
          severity: "HIGH",
          title: "Filing deadline approaching",
          message:
            "Closing for 701 S Olive Ave is within 48 hours; FinCEN report is still in draft.",
        },
        {
          org_id: org.id,
          transaction_id: tx3.id,
          type: "MISSING_DATA",
          severity: "MEDIUM",
          title: "Missing beneficial owner IDs",
          message:
            "Government-issued ID images are still required for two beneficial owners on the Oceanview Holdings file.",
        },
        {
          org_id: org.id,
          transaction_id: null,
          type: "REGULATION_UPDATE",
          severity: "LOW",
          title: "FinCEN guidance update — March 2026",
          message:
            "Treasury published minor clarifications on entity exemptions for certain residential transfers. Review compliance bulletin in the resource center.",
        },
      ],
    });

    const counts = {
      organizations: await prisma.organization.count(),
      users: await prisma.user.count(),
      transactions: await prisma.transaction.count(),
      beneficialOwners: await prisma.beneficialOwner.count(),
      entityDetails: await prisma.entityDetail.count(),
      trustDetails: await prisma.trustDetail.count(),
      filings: await prisma.filing.count(),
      auditLogs: await prisma.auditLog.count(),
      alerts: await prisma.alert.count(),
    };

    const byStatus = await prisma.transaction.groupBy({
      by: ["status"],
      _count: true,
    });

    const filingByStatus = await prisma.filing.groupBy({
      by: ["status"],
      _count: true,
    });

    console.log("\nSeed complete — Sunshine Title & Escrow, LLC\n");
    console.log("Counts:", JSON.stringify(counts, null, 2));
    console.log("Transactions by status:", JSON.stringify(byStatus, null, 2));
    console.log("Filings by status:", JSON.stringify(filingByStatus, null, 2));

    const verify =
      counts.organizations === 1 &&
      counts.users === 3 &&
      counts.transactions === 8 &&
      counts.filings === 3 &&
      counts.auditLogs === 10 &&
      counts.alerts === 3 &&
      byStatus.length >= 6;

    if (!verify) {
      throw new Error("Verification failed: unexpected row counts.");
    }
    console.log("\nVerification passed.\n");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
