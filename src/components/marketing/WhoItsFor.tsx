import { Building2, FileCheck, Landmark, Scale, ShieldCheck } from "lucide-react";

const topAudienceCards = [
  {
    Icon: Building2,
    title: "Title Agencies",
    description:
      "From solo shops to multi-office operations. Automate FinCEN filing across your entire team.",
  },
  {
    Icon: Scale,
    title: "Closing Attorneys",
    description:
      "Real estate attorneys handling closings need FinCEN filing without adding compliance staff.",
  },
  {
    Icon: ShieldCheck,
    title: "Escrow Companies",
    description:
      "Settlement agents managing escrow accounts need OFAC and FinCEN filing on every cash transaction.",
  },
];

const bottomAudienceCards = [
  {
    Icon: Landmark,
    title: "Real Estate Law Firms",
    description:
      "Firms handling closings at scale need automated compliance workflows.",
  },
  {
    Icon: FileCheck,
    title: "Lender Settlement Partners",
    description:
      "Lenders requiring settlement partners to demonstrate federal filing compliance.",
  },
];

export function WhoItsFor() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
          Built for Title Industry Professionals
        </h2>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          {topAudienceCards.map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-gray-100 bg-gray-50 p-8"
            >
              <card.Icon className="h-10 w-10 text-[#2563EB]" />
              <h3 className="mt-4 text-xl font-semibold text-[#0F172A]">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                {card.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-6 grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
          {bottomAudienceCards.map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-gray-100 bg-gray-50 p-8"
            >
              <card.Icon className="h-10 w-10 text-[#2563EB]" />
              <h3 className="mt-4 text-xl font-semibold text-[#0F172A]">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
