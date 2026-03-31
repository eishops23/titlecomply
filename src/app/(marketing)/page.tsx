import type { Metadata } from "next";
import Link from "next/link";
import {
  Bell,
  ClipboardList,
  FileSpreadsheet,
  FileCheck,
  FileSearch,
  FileText,
  Lock,
  ShieldAlert,
  Shield,
  TriangleAlert,
} from "lucide-react";
import { FreeToolsBanner } from "@/components/marketing/FreeToolsBanner";
import { WhoItsFor } from "@/components/marketing/WhoItsFor";
import { RegulatoryBadges } from "@/components/marketing/RegulatoryBadges";
import { EnterpriseProof } from "@/components/marketing/EnterpriseProof";
import { LeadCapture } from "@/components/marketing/LeadCapture";
import { MarketingFaq } from "@/components/marketing/MarketingFaq";
import { ProductDemo } from "@/components/marketing/ProductDemo";
import { PricingCards } from "@/components/marketing/PricingCards";
import { ComplianceAssessment } from "@/components/marketing/ComplianceAssessment";
import { RoiCalculator } from "@/components/marketing/RoiCalculator";
import { SocialProof } from "@/components/marketing/SocialProof";
import { JsonLd } from "@/components/seo/JsonLd";
import { MARKETING_FAQ_ITEMS } from "@/lib/marketing-faq-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FinCEN Compliance Automation for Title & Escrow | TitleComply",
  description:
    "The compliance platform for title companies — FinCEN, OFAC, wire fraud prevention, and 1099-S in one place.",
  alternates: { canonical: "https://titlecomply.com" },
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "TitleComply",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://titlecomply.com",
  description:
    "AI-powered FinCEN Real Estate Report compliance automation for title companies and escrow agents.",
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "29",
    highPrice: "999",
    priceCurrency: "USD",
    offerCount: 4,
  },
  featureList: [
    "FinCEN screening engine",
    "OFAC sanctions screening",
    "Wire fraud prevention",
    "1099-S reporting",
    "Guided data collection",
    "AI document extraction",
    "One-click report generation",
    "Tamper-proof audit trail",
    "Automated reminders",
  ],
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TitleComply",
  url: "https://titlecomply.com",
  logo: "https://titlecomply.com/logo.png",
  description:
    "FinCEN compliance automation for title and escrow companies.",
  address: {
    "@type": "PostalAddress",
    addressRegion: "FL",
    addressCountry: "US",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "support@titlecomply.com",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: MARKETING_FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

const howSteps = [
  {
    n: 1,
    Icon: Shield,
    title: "Screen",
    body: "Enter the property and buyer information. Get an instant FinCEN determination — required, not required, or needs review.",
  },
  {
    n: 2,
    Icon: ClipboardList,
    title: "Collect",
    body: "Guided forms collect every required field: beneficial ownership, entity details, seller information, and settlement agent data.",
  },
  {
    n: 3,
    Icon: FileSearch,
    title: "Extract",
    body: "Upload the operating agreement or trust document. AI extracts entity names, members, EINs, and ownership percentages automatically.",
  },
  {
    n: 4,
    Icon: FileCheck,
    title: "File",
    body: "One-click FinCEN Real Estate Report generation. Download the PDF and submit through BSA E-Filing.",
  },
];

const featureCards = [
  {
    Icon: Shield,
    title: "Smart Screening Engine",
    body: "Instant FinCEN determination. Enter property and buyer details — get an immediate YES/NO/REVIEW result based on 31 CFR Part 1031 criteria.",
  },
  {
    Icon: ClipboardList,
    title: "Guided Data Collection",
    body: "Step-by-step forms collect every required FinCEN field: beneficial ownership, entity details, seller information, and settlement agent data.",
  },
  {
    Icon: FileSearch,
    title: "AI Document Extraction",
    body: "Upload an operating agreement or trust document. Our AI reads the document and auto-fills entity names, members, EINs, and ownership percentages.",
  },
  {
    Icon: FileText,
    title: "One-Click Report Generation",
    body: "Generate a complete FinCEN Real Estate Report PDF in one click. All six required parts populated, validated, and ready for BSA E-Filing.",
  },
  {
    Icon: Lock,
    title: "Tamper-Proof Audit Trail",
    body: "Every action logged with SHA-256 hash chain integrity. Prove exactly who did what and when — essential for FinCEN examinations.",
  },
  {
    Icon: Bell,
    title: "Automated Reminders",
    body: "Never miss a filing deadline. Automatic email reminders for missing data, overdue filings, and approaching deadlines keep your team on track.",
  },
  {
    Icon: ShieldAlert,
    title: "OFAC Sanctions Screening",
    body: "Instantly screen all transaction parties against OFAC lists with timestamped certificates.",
  },
  {
    Icon: TriangleAlert,
    title: "Wire Fraud Prevention",
    body: "Detect suspicious wire changes and require multi-party confirmation before funds are sent.",
  },
  {
    Icon: FileSpreadsheet,
    title: "1099-S Reporting",
    body: "Generate and export 1099-S filings from your existing transaction data for year-end reporting.",
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={softwareSchema} />
      <JsonLd data={orgSchema} />
      <JsonLd data={faqSchema} />
      <section className="bg-white pb-20 pt-24 md:pb-28 md:pt-32">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="text-center text-5xl font-bold leading-[1.1] tracking-tight text-[#0F172A] md:text-6xl">
            The compliance platform for title companies.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-gray-500 md:text-xl">
            FinCEN, OFAC, wire fraud prevention, and 1099-S reporting in one
            workflow built for title and escrow teams.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="rounded-lg bg-[#2563EB] px-8 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Start Free Trial
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-lg border border-gray-300 px-8 py-3.5 text-base font-medium text-gray-700 transition-colors hover:border-gray-400"
            >
              See How It Works
            </Link>
          </div>
          <p className="mt-6 text-center text-sm text-gray-400">
            14-day free trial · Cancel anytime · No charge until day 15
          </p>
        </div>
      </section>

      <ProductDemo />
      <WhoItsFor />

      <section className="bg-gray-50/50 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
            The FinCEN Problem
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-gray-500">
            A new federal rule is creating massive compliance burden for title
            companies.
          </p>
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                stat: "March 1, 2026",
                desc: "FinCEN's anti-money laundering rule for real estate is now in effect. Title companies must file on non-financed transfers to entities.",
              },
              {
                stat: "3+ Hours",
                desc: "Average time to manually complete a single FinCEN filing — collecting beneficial ownership data, validating fields, generating the report.",
              },
              {
                stat: "$50,000+",
                desc: "Potential federal penalty per violation for failure to file. Willful violations can result in criminal prosecution.",
              },
              {
                stat: "88%",
                desc: "Of title companies with under 50 employees have no dedicated compliance department or filing process in place.",
              },
            ].map((card) => (
              <div
                key={card.stat}
                className="rounded-xl bg-white p-8 shadow-sm"
              >
                <p className="text-3xl font-bold text-[#1E3A5F]">{card.stat}</p>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="bg-white py-24 md:py-32"
      >
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
            How TitleComply Works
          </h2>
          <p className="mt-4 text-center text-lg text-gray-500">
            From intake to filing in 15 minutes
          </p>

          <div className="relative mt-16">
            <div
              className="pointer-events-none absolute left-0 right-0 top-5 hidden border-t-2 border-dashed border-gray-200 md:block"
              aria-hidden
            />
            <div className="relative z-10 grid grid-cols-1 gap-12 md:grid-cols-4">
              {howSteps.map((step) => (
                <div key={step.n} className="flex flex-col items-center text-center">
                  <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#2563EB] text-sm font-bold text-white">
                    {step.n}
                  </div>
                  <step.Icon className="mt-4 h-8 w-8 text-[#2563EB]" />
                  <h3 className="mt-4 text-lg font-semibold text-[#0F172A]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-gray-50/50 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
            Everything You Need to Stay Compliant
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-gray-500">
            Built specifically for FinCEN 31 CFR Part 1031 compliance.
          </p>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((f) => (
              <div
                key={f.title}
                className="rounded-xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                  <f.Icon className="h-6 w-6 text-[#2563EB]" />
                </div>
                <h3 className="text-lg font-semibold text-[#0F172A]">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RegulatoryBadges />

      <FreeToolsBanner />

      <EnterpriseProof />

      <SocialProof />

      <section className="bg-white py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-gray-500">
            14-day free trial on every plan. Cancel anytime before day 15 — no
            charge.
          </p>
          <div className="mt-12">
            <PricingCards highlightPlan="PROFESSIONAL" />
          </div>
          <p className="mt-8 text-center text-sm text-gray-400">
            All plans include screening, data collection, filing generation, and
            audit trail.
          </p>
        </div>
      </section>

      <ComplianceAssessment />

      <RoiCalculator />

      <LeadCapture />

      <section className="bg-white py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
            Frequently Asked Questions
          </h2>
          <MarketingFaq />
        </div>
      </section>

      <section className="bg-[#0F172A] py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Don&apos;t risk non-compliance.
          </h2>
          <p className="mt-4 text-xl text-gray-400">Start your free trial today.</p>
          <Link
            href="/sign-up"
            className="mt-8 inline-block rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-[#0F172A] transition-colors hover:bg-gray-100"
          >
            Start Free Trial
          </Link>
          <p className="mt-6 text-sm text-gray-500">
            14-day trial · Cancel anytime · Trusted by title companies across
            Florida
          </p>
        </div>
      </section>
    </>
  );
}
