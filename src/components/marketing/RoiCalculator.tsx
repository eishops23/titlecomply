"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Clock, DollarSign, ShieldAlert } from "lucide-react";

function SliderField({
  label,
  min,
  max,
  value,
  onChange,
  suffix = "",
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center justify-between text-sm font-medium text-[#0F172A]">
        <span>{label}</span>
        <span className="ml-2 text-sm font-semibold text-[#2563EB]">
          {value}
          {suffix}
        </span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="range-slider h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200"
      />
    </div>
  );
}

export function RoiCalculator() {
  const [closingsPerMonth, setClosingsPerMonth] = useState(15);
  const [hoursPerFiling, setHoursPerFiling] = useState(3);
  const [employeeCost, setEmployeeCost] = useState(75);
  const [fincenPercent, setFincenPercent] = useState(60);

  const computed = useMemo(() => {
    const fincenClosings = Math.round(closingsPerMonth * (fincenPercent / 100));
    const manualHoursPerMonth = fincenClosings * hoursPerFiling;
    const titleComplyHoursPerMonth = fincenClosings * 0.25;
    const hoursSaved = Math.max(0, manualHoursPerMonth - titleComplyHoursPerMonth);
    const costSaved = Math.max(0, Math.round(hoursSaved * employeeCost));
    const penaltyRiskEliminated = fincenClosings * 50000;

    const recommendedPlan =
      closingsPerMonth <= 25
        ? "Starter ($199/mo)"
        : closingsPerMonth <= 100
          ? "Professional ($499/mo)"
          : "Enterprise ($999/mo)";

    const recommendedPrice =
      closingsPerMonth <= 25 ? 199 : closingsPerMonth <= 100 ? 499 : 999;

    const netSavings = Math.round(costSaved - recommendedPrice);
    const roiPercent =
      recommendedPrice > 0
        ? Math.round((netSavings / recommendedPrice) * 100)
        : 0;

    return {
      hoursSaved: Math.round(hoursSaved),
      costSaved,
      penaltyRiskEliminated,
      recommendedPlan,
      recommendedPrice,
      netSavings,
      roiPercent,
      fincenClosings,
    };
  }, [closingsPerMonth, employeeCost, fincenPercent, hoursPerFiling]);

  return (
    <section id="roi-calculator" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
          How Much Could You Save?
        </h2>
        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="space-y-7">
              <SliderField
                label="Closings per month"
                min={1}
                max={100}
                value={closingsPerMonth}
                onChange={setClosingsPerMonth}
              />
              <SliderField
                label="Hours per filing (manual)"
                min={1}
                max={8}
                value={hoursPerFiling}
                onChange={setHoursPerFiling}
              />
              <SliderField
                label="Average employee cost ($/hour)"
                min={25}
                max={200}
                value={employeeCost}
                onChange={setEmployeeCost}
              />
              <SliderField
                label="% requiring FinCEN filing"
                min={10}
                max={100}
                value={fincenPercent}
                onChange={setFincenPercent}
                suffix="%"
              />
            </div>
          </div>

          <div className="rounded-xl bg-[#0F172A] p-8 text-white shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              Your Savings
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <p className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="h-4 w-4" />
                  Time saved
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {computed.hoursSaved} hours / month
                </p>
              </div>
              <div>
                <p className="flex items-center gap-2 text-sm text-gray-400">
                  <DollarSign className="h-4 w-4" />
                  Cost saved
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  ${computed.costSaved.toLocaleString()} / month
                </p>
              </div>
              <div>
                <p className="flex items-center gap-2 text-sm text-gray-400">
                  <ShieldAlert className="h-4 w-4 text-red-400" />
                  Penalty risk eliminated
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  ${computed.penaltyRiskEliminated.toLocaleString()} / month
                </p>
              </div>
            </div>

            <div className="my-5 border-t border-gray-700" />

            <p className="text-sm text-gray-400">
              TitleComply cost: {computed.recommendedPlan}
            </p>
            <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
              Net Savings
            </p>
            <p className="text-3xl font-bold text-green-400">
              ${computed.netSavings.toLocaleString()} / month
            </p>
            <p className="mt-2 text-sm text-gray-400">
              That&apos;s a {computed.roiPercent}% return on investment.
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Based on {computed.fincenClosings} FinCEN-required closings/month.
            </p>

            <Link
              href="/sign-up"
              className="mt-6 inline-block w-full rounded-lg bg-white px-6 py-3 text-center font-semibold text-[#0F172A] transition-colors hover:bg-gray-100"
            >
              Start Free Trial →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
