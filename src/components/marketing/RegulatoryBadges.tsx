import { FileCheck, Link as LinkIcon, Lock, Scale } from "lucide-react";

const badges = [
  {
    Icon: Scale,
    title: "31 CFR Part 1031",
    subtitle: "FINCEN COMPLIANT",
    description:
      "Purpose-built for the FinCEN Real Estate Report rule effective March 1, 2026.",
  },
  {
    Icon: FileCheck,
    title: "BSA E-Filing",
    subtitle: "FILING READY",
    description:
      "Generates reports in the exact format required by FinCEN's BSA E-Filing System.",
  },
  {
    Icon: Lock,
    title: "AES-256-GCM",
    subtitle: "BANK-GRADE ENCRYPTION",
    description:
      "SSNs, EINs, and all PII encrypted with the same standard used by financial institutions.",
  },
  {
    Icon: LinkIcon,
    title: "SHA-256 Hash Chain",
    subtitle: "TAMPER-EVIDENT AUDIT",
    description:
      "Every action cryptographically linked. Prove exactly who did what and when during examinations.",
  },
];

export function RegulatoryBadges() {
  return (
    <section className="bg-[#0F172A] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white md:text-4xl">
          Built for Federal Compliance Standards
        </h2>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
          {badges.map((badge) => (
            <div
              key={badge.title}
              className="rounded-xl border border-white/10 bg-white/5 p-6 text-center"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-white/10">
                <badge.Icon className="h-7 w-7 text-blue-400" />
              </div>
              <p className="mt-3 text-lg font-bold text-white">{badge.title}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-blue-300">
                {badge.subtitle}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                {badge.description}
              </p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-gray-400">
          Your data is protected with the same encryption standard used by banks
          and federal agencies. Every action is recorded in a
          cryptographically-verified audit trail that stands up to FinCEN
          examination.
        </p>
      </div>
    </section>
  );
}
