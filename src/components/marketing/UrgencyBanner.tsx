"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

const DISMISS_KEY = "titlecomply:urgency-banner-dismissed";

export function UrgencyBanner() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem(DISMISS_KEY) === "true";
    setDismissed(isDismissed);
  }, []);

  if (dismissed) {
    return null;
  }

  return (
    <div className="relative bg-[#0F172A] px-6 py-2.5 text-center text-sm text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-center pr-10">
        <span className="relative mr-2 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        </span>
        <AlertTriangle className="mr-2 inline h-4 w-4 shrink-0 text-amber-400" />
        <p className="text-sm text-gray-200">
          FinCEN&apos;s Real Estate Report rule took effect March 1, 2026. Title
          companies must file on every non-financed entity transaction.
          Penalties start at{" "}
          <span className="font-semibold text-white">$50,000 per violation</span>.
          <Link
            href="#roi-calculator"
            className="ml-2 font-semibold text-amber-400 underline underline-offset-2 transition-colors hover:text-amber-300"
          >
            Check Your Risk →
          </Link>
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          sessionStorage.setItem(DISMISS_KEY, "true");
          setDismissed(true);
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-white"
        aria-label="Dismiss urgency banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
