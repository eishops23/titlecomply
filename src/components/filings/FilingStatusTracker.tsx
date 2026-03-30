"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type FilingPipelineStatus =
  | "DRAFT"
  | "VALIDATED"
  | "GENERATED"
  | "FILED"
  | "ACCEPTED"
  | "REJECTED";

const steps: Array<{ key: Exclude<FilingPipelineStatus, "REJECTED">; label: string }> = [
  { key: "DRAFT", label: "Draft" },
  { key: "VALIDATED", label: "Validated" },
  { key: "GENERATED", label: "Generated" },
  { key: "FILED", label: "Filed" },
  { key: "ACCEPTED", label: "Accepted" },
];

export function FilingStatusTracker({ currentStatus }: { currentStatus: FilingPipelineStatus }) {
  const currentIndex =
    currentStatus === "REJECTED"
      ? 3
      : Math.max(
          0,
          steps.findIndex((step) => step.key === currentStatus),
        );

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Filing Pipeline
      </p>
      <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isRejected = currentStatus === "REJECTED" && isCurrent;

          return (
            <React.Fragment key={step.key}>
              <div className="flex min-w-20 flex-col items-center gap-1 text-center">
                <span
                  className={cn(
                    "h-5 w-5 rounded-full border-2",
                    isCompleted
                      ? "border-emerald-600 bg-emerald-600"
                      : isRejected
                        ? "border-danger bg-danger"
                        : isCurrent
                          ? "animate-pulse border-accent bg-accent"
                          : "border-slate-300 bg-white",
                  )}
                />
                <span
                  className={cn(
                    "text-xs",
                    isCompleted
                      ? "text-emerald-700"
                      : isRejected
                        ? "font-semibold text-danger"
                        : isCurrent
                          ? "font-semibold text-accent"
                          : "text-slate-500",
                  )}
                >
                  {isRejected ? "Rejected" : step.label}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <div
                  className={cn(
                    "h-0.5 flex-1 min-w-8",
                    index < currentIndex ? "bg-emerald-500" : "bg-slate-300",
                  )}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
