import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 md:py-32">
      <h1 className="text-4xl font-bold tracking-tight text-[#0F172A] md:text-5xl">
        About TitleComply
      </h1>

      <section className="mt-12 border-t border-gray-100 pt-12">
        <h2 className="text-2xl font-semibold text-[#0F172A]">Our mission</h2>
        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          We believe every title company — no matter the size — deserves access
          to enterprise-grade compliance automation. TitleComply was built by a
          real estate professional who saw firsthand how FinCEN&apos;s new Real
          Estate Report rule would overwhelm small shops without dedicated
          compliance teams.
        </p>
      </section>

      <section className="mt-16 border-t border-gray-100 pt-12">
        <h2 className="text-2xl font-semibold text-[#0F172A]">Team</h2>
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
              style={{ backgroundColor: "#1E3A5F" }}
            >
              JA
            </div>
            <div>
              <p className="text-xl font-semibold text-[#0F172A]">Jon Alcius</p>
              <p className="text-sm font-medium text-gray-500">
                Founder &amp; CEO
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                15 years in tech and real estate. Background in Architecture and
                Urban &amp; Regional Planning. Previously Planning Manager at Lake
                Worth Beach. Building AI-powered compliance tools for regulated
                industries.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 border-t border-gray-100 pt-12 text-center">
        <h2 className="text-xl font-semibold text-[#0F172A]">
          Have questions?
        </h2>
        <Link
          href="/contact"
          className="mt-6 inline-block rounded-lg bg-[#2563EB] px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Contact us
        </Link>
      </section>
    </div>
  );
}
