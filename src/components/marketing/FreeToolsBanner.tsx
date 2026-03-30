import Link from "next/link";
import { Search } from "lucide-react";

export function FreeToolsBanner() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="rounded-2xl border border-gray-100 bg-gray-50/50 px-8 py-12">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 md:flex-row">
            <div className="w-full md:w-[70%]">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
                <Search className="h-7 w-7 text-[#2563EB]" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-[#0F172A]">
                Free OFAC Screening Tool
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Screen any name against the US Treasury&apos;s SDN sanctions
                list instantly, no signup required. Used by title officers
                before every closing to verify buyers, sellers, and beneficial
                owners are not on the OFAC sanctions list.
              </p>
            </div>
            <div className="w-full md:w-[30%] md:text-right">
              <Link
                href="/tools/ofac-screening"
                className="inline-flex whitespace-nowrap rounded-lg border-2 border-[#2563EB] px-6 py-3 font-semibold text-[#2563EB] transition-colors hover:bg-[#2563EB] hover:text-white"
              >
                Try Free OFAC Screening →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
