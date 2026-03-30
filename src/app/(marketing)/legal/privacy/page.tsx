import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "TitleComply privacy policy. How we collect, use, and protect your data.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: March 2026</p>

      <div className="mt-12 space-y-10 text-gray-600">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#0F172A]">Introduction</h2>
          <p className="leading-relaxed">
            TitleComply (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;)
            provides software and services to help title companies and
            settlement agents meet FinCEN Real Estate Report obligations under 31
            CFR Part 1031. This Privacy Policy describes how we collect, use,
            store, and share personal information when you use our website and
            services at titlecomply.com (the &quot;Service&quot;).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#0F172A]">
            Information we collect
          </h2>
          <p className="leading-relaxed">
            We collect information you provide directly (such as name, email,
            company name, billing details, and messages submitted through contact
            forms), account and authentication data processed by our identity
            provider, transaction and filing data you enter into the Service
            (including property information, entity and beneficial ownership
            details, and document uploads), technical data (IP address, browser
            type, device identifiers, and usage logs), and communications with
            our support team.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#0F172A]">
            How we use information
          </h2>
          <p className="leading-relaxed">
            We use personal information to provide, maintain, and improve the
            Service; authenticate users; process subscriptions and payments;
            generate FinCEN reports and audit trails; send transactional emails
            and service notices; respond to inquiries; detect and prevent fraud
            and abuse; comply with legal obligations; and analyze aggregated,
            de-identified usage trends.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#0F172A]">
            Data security
          </h2>
          <p className="leading-relaxed">
            Sensitive fields (such as Social Security numbers, employer
            identification numbers, dates of birth, and government ID numbers)
            are encrypted at the application layer using AES-256-GCM before
            storage. Data is transmitted over TLS. We maintain administrative,
            technical, and organizational safeguards appropriate to the nature
            of the data we process. No method of transmission or storage is
            completely secure; we work to protect your information using
            industry-standard practices.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#0F172A]">Retention</h2>
          <p className="leading-relaxed">
            We retain account and transaction data for as long as your account
            is active and as needed to provide the Service. By default, records
            supporting compliance workflows are retained for at least five (5)
            years from the date of creation or last activity, consistent with
            typical regulatory expectations for financial compliance records,
            unless a shorter period is required by law or agreed in writing.
            When data is no longer needed, we delete or de-identify it in
            accordance with our retention schedules.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#0F172A]">
            Third-party services
          </h2>
          <p className="leading-relaxed">
            We use subprocessors that may process personal data on our behalf,
            including: Clerk (authentication and user management), Stripe
            (payment processing), SendGrid (transactional email), and Anthropic
            (Claude API for document extraction and related features). Each
            provider is contractually required to protect data and process it
            only as instructed. We may update our subprocessor list from time to
            time.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#0F172A]">Your rights</h2>
          <p className="leading-relaxed">
            Depending on where you live, you may have rights to access, correct,
            delete, or export your personal information; object to or restrict
            certain processing; or withdraw consent where processing is
            consent-based. To exercise these rights, contact us at{" "}
            <a
              href="mailto:support@titlecomply.com"
              className="text-[#2563EB] hover:underline"
            >
              support@titlecomply.com
            </a>
            . We will respond in accordance with applicable law.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#0F172A]">
            Children&apos;s privacy
          </h2>
          <p className="leading-relaxed">
            The Service is not directed to individuals under 16. We do not
            knowingly collect personal information from children. If you believe
            we have collected information from a child, please contact us and we
            will take steps to delete it.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#0F172A]">
            Changes to this policy
          </h2>
          <p className="leading-relaxed">
            We may update this Privacy Policy from time to time. We will post
            the revised policy on this page and update the &quot;Last
            updated&quot; date. Material changes may be communicated by email or
            in-product notice where appropriate.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#0F172A]">Contact</h2>
          <p className="leading-relaxed">
            Questions about this Privacy Policy:{" "}
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
