"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { MARKETING_FAQ_ITEMS } from "@/lib/marketing-faq-data";
import { cn } from "@/lib/utils";

export function MarketingFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto mt-12 max-w-3xl">
      {MARKETING_FAQ_ITEMS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="border-b border-gray-100">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span className="text-base font-medium text-[#0F172A]">
                {item.q}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-gray-400 transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            {isOpen ? (
              <p className="pb-5 text-sm leading-relaxed text-gray-500">
                {item.a}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
