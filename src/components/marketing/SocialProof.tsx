export function SocialProof() {
  return (
    <section className="bg-gray-50/50 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
          <div>
            <p className="text-4xl font-bold text-[#1E3A5F]">March 1, 2026</p>
            <p className="mt-2 text-sm text-gray-500">
              Rule effective date - every title company is now required to file
            </p>
          </div>
          <div>
            <p className="text-4xl font-bold text-[#1E3A5F]">$50,000+</p>
            <p className="mt-2 text-sm text-gray-500">
              Per-violation federal penalty for failure to file
            </p>
          </div>
          <div>
            <p className="text-4xl font-bold text-[#1E3A5F]">15 Minutes</p>
            <p className="mt-2 text-sm text-gray-500">
              Average time to complete a filing with TitleComply
            </p>
          </div>
        </div>

        <div className="mt-16">
          <div className="mx-auto max-w-3xl rounded-xl border border-gray-100 bg-white p-8 shadow-sm md:p-12">
            <div className="font-serif text-6xl leading-none text-[#2563EB] opacity-20">
              &ldquo;
            </div>
            <p className="text-lg italic leading-relaxed text-[#0F172A] md:text-xl">
              I watched title companies across South Florida scramble to
              understand the new FinCEN rule. Most had no process, no
              automation, and no idea the penalties could hit $50,000 per
              missed filing. I built TitleComply because every title company in
              America needs this - not just the ones that can afford a
              compliance department.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1E3A5F] font-bold text-white">
                JA
              </div>
              <div>
                <p className="font-semibold text-[#0F172A]">Jon Alcius</p>
                <p className="text-sm text-gray-500">
                  Founder &amp; CEO, Former Planning Manager, Lake Worth Beach
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
