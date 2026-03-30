"use client";

import { Lock } from "lucide-react";
import Link from "next/link";

interface UpgradePromptProps {
  feature: string;
  requiredPlan: string;
  currentPlan: string;
  className?: string;
}

export function UpgradePrompt({
  feature,
  requiredPlan,
  currentPlan,
  className,
}: UpgradePromptProps) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-gray-50 p-8 text-center ${className || ""}`}>
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <Lock className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-[#0F172A]">{feature}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
        This feature requires a <strong>{requiredPlan}</strong> plan or higher. You are
        currently on the <strong>{currentPlan}</strong> plan.
      </p>
      <Link
        href="/settings/billing"
        className="mt-6 inline-block rounded-lg bg-[#2563EB] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        Upgrade Plan
      </Link>
    </div>
  );
}
