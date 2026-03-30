import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "TitleComply terms of service. Usage terms, billing, and compliance disclaimer.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: March 2026</p>

      <div className="mt-12 space-y-10 text-gray-600">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#0F172A]">Agreement</h2>
          <p className="leading-relaxed">
            These Terms of Service (&quot;Terms&quot;) govern your access to and
            use of TitleComply&apos;s websites, applications, and related
            services (collectively, the &quot;Service&quot;) operated by
            TitleComply (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By
            creating an account, subscribing, or using the Service, you agree to
            these Terms. If you are entering into these Terms on behalf of a
            company or other legal entity, you represent that you have
            authority to bind that entity.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#0F172A]">
            Description of the Service
          </h2>
          <p className="leading-relaxed">
            TitleComply provides tools to support FinCEN Real Estate Report
            workflows under 31 CFR Part 1031, including screening, data
            collection, document-assisted extraction, report generation, and
            audit logging. Features vary by plan. The Service does not
            guarantee any particular regulatory outcome or filing acceptance by
            FinCEN.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#0F172A]">Accounts</h2>
          <p className="leading-relaxed">
            You must provide accurate registration information and safeguard your
            credentials. You are responsible for all activity under your account.
            We may suspend or terminate accounts that violate these Terms or
            pose a security risk.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#0F172A]">
            Free trial and billing
          </h2>
          <p className="leading-relaxed">
            <strong className="font-semibold text-[#0F172A]">
              Free trial.
            </strong>{" "}
            Paid plans may include a fourteen (14) day free trial with full
            access to applicable features. You must provide a valid payment
            method at signup. You will not be charged subscription fees until
            the first day after the trial ends (day fifteen), unless otherwise
            disclosed at checkout. You may cancel your subscription at any time
            during the trial through your billing settings or by contacting
            support; if you cancel before the trial ends, you will not be
            charged the subscription fee for that plan.
          </p>
          <p className="leading-relaxed">
            <strong className="font-semibold text-[#0F172A]">
              Paid subscriptions.
            </strong>{" "}
            After the trial, fees are billed in advance on a monthly basis (or
            as otherwise selected) through Stripe. Taxes may apply. Failure to pay
            may result in suspension or termination of access.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#0F172A]">
            Acceptable use
          </h2>
          <p className="leading-relaxed">
            You agree not to misuse the Service, including by attempting to gain
            unauthorized access, interfering with operation, uploading malware,
            scraping except as allowed by robots.txt and applicable law, or using
            the Service for unlawful purposes. You will comply with all
            applicable laws, including anti-money laundering and sanctions
            requirements, in your use of the Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#0F172A]">
            Data ownership
          </h2>
          <p className="leading-relaxed">
            You retain ownership of data you submit. You grant us a license to
            host, process, and display that data solely to provide and improve
            the Service, enforce security, and comply with law. We do not sell
            your personal information.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#0F172A]">
            Compliance disclaimer
          </h2>
          <p className="leading-relaxed">
            TitleComply is{" "}
            <strong className="font-semibold text-[#0F172A]">not</strong> a law
            firm and does not provide legal advice. Nothing in the Service
            constitutes legal, tax, or professional advice. You are solely
            responsible for the accuracy and completeness of information
            submitted in any FinCEN filing and for your compliance with 31 CFR
            Part 1031 and other applicable laws and regulations. You should
            consult qualified counsel regarding your obligations.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#0F172A]">
            Disclaimer of warranties
          </h2>
          <p className="leading-relaxed">
            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS
            AVAILABLE.&quot; TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM
            ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY,
            FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#0F172A]">
            Limitation of liability
          </h2>
          <p className="leading-relaxed">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, TITLECOMPLY AND ITS
            AFFILIATES, OFFICERS, AND EMPLOYEES WILL NOT BE LIABLE FOR ANY
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
            OR FOR LOST PROFITS, DATA, OR GOODWILL. OUR AGGREGATE LIABILITY
            ARISING OUT OF THESE TERMS OR THE SERVICE WILL NOT EXCEED THE
            GREATER OF THE AMOUNTS YOU PAID US IN THE TWELVE (12) MONTHS BEFORE
            THE CLAIM OR ONE HUNDRED U.S. DOLLARS ($100), EXCEPT WHERE
            PROHIBITED BY LAW.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#0F172A]">Termination</h2>
          <p className="leading-relaxed">
            You may stop using the Service at any time. We may suspend or
            terminate access for breach of these Terms or for operational or
            legal reasons. Upon termination, your right to use the Service
            ceases. For thirty (30) days after termination (unless a shorter
            period is required by law), we will provide a reasonable means to
            export your data where technically feasible.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#0F172A]">
            Governing law
          </h2>
          <p className="leading-relaxed">
            These Terms are governed by the laws of the State of Florida,
            excluding conflict-of-law principles. Courts in Florida shall have
            exclusive jurisdiction, subject to mandatory arbitration or venue
            rules that cannot be waived by contract.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#0F172A]">Contact</h2>
          <p className="leading-relaxed">
            Questions about these Terms:{" "}
            <a
              href="mailto:support@titlecomply.com"
              className="text-[#2563EB] hover:underline"
            >
              support@titlecomply.com
            </a>{" "}
            or{" "}
            <Link href="/contact" className="text-[#2563EB] hover:underline">
              our contact page
            </Link>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
