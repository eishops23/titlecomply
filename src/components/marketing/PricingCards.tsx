"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { PLAN_PRICING } from "@/lib/constants";
import type { PlanId } from "@/lib/constants";

const ORDER: PlanId[] = [
  "STARTER",
  "PROFESSIONAL",
  "ENTERPRISE",
  "PAY_PER_FILE",
];

type PricingCardsProps = {
  highlightPlan?: PlanId;
};

export function PricingCards({ highlightPlan = "PROFESSIONAL" }: PricingCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {ORDER.map((planId) => {
        const plan = PLAN_PRICING[planId];
        const highlighted = planId === highlightPlan;
        const isEnterprise = planId === "ENTERPRISE";

        return (
          <div
            key={planId}
            className={
              highlighted
                ? "relative rounded-xl border-2 border-[#2563EB] bg-white p-8"
                : "rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
            }
          >
            {highlighted ? (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#2563EB] px-3 py-1 text-xs font-semibold text-white">
                Most Popular
              </span>
            ) : null}

            <h3 className="text-lg font-semibold text-[#0F172A]">{plan.name}</h3>

            <p className="mt-4 text-4xl font-bold text-[#0F172A]">
              ${plan.price}
              <span className="text-base font-normal text-gray-500">
                {planId === "PAY_PER_FILE" ? " /filing" : " /month"}
              </span>
            </p>

            <div className="my-6 border-t border-gray-100" />

            <ul className="space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm text-gray-600">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]"
                    aria-hidden
                  />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {isEnterprise ? (
                <Link
                  href="/contact"
                  className="block w-full rounded-lg border border-gray-300 py-3 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Contact Sales
                </Link>
              ) : highlighted ? (
                <Link
                  href="/sign-up"
                  className="block w-full rounded-lg bg-[#2563EB] py-3 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Start Free Trial
                </Link>
              ) : (
                <Link
                  href="/sign-up"
                  className="block w-full rounded-lg border border-gray-300 py-3 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Start Free Trial
                </Link>
              )}
              <p className="mt-3 text-center text-xs text-gray-400">
                14-day free trial
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
