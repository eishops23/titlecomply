"use client";

import * as React from "react";
import type { ValidationResult } from "@/lib/validation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const categoryLabels: Record<string, string> = {
  property: "Property",
  transaction: "Transaction",
  entity: "Entity",
  trust: "Trust",
  beneficial_owners: "Beneficial Owners",
  seller: "Seller",
  settlement_agent: "Settlement Agent",
};

export function ValidationPanel({
  result,
  isLoading,
}: {
  result: ValidationResult | null;
  isLoading: boolean;
}) {
  const [open, setOpen] = React.useState<Record<string, boolean>>({});

  const groupedChecks = React.useMemo(() => {
    if (!result) return [];
    return Object.entries(
      result.checks.reduce<Record<string, typeof result.checks>>((acc, check) => {
        if (!acc[check.category]) acc[check.category] = [];
        acc[check.category].push(check);
        return acc;
      }, {}),
    );
  }, [result]);

  React.useEffect(() => {
    if (!result) return;
    const next: Record<string, boolean> = {};
    for (const [category, checks] of groupedChecks) {
      next[category] = checks.some((check) => check.status !== "pass");
    }
    setOpen(next);
  }, [groupedChecks, result]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-sm text-slate-600">Running validation...</CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Validation</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          Run validation to check all required FinCEN fields are complete.
        </CardContent>
      </Card>
    );
  }

  const failCount = result.checks.filter((check) => check.status === "fail").length;
  const warningCount = result.checks.filter((check) => check.status === "warning").length;
  const bannerClass = failCount
    ? "border-danger/30 bg-red-50 text-danger"
    : warningCount
      ? "border-amber-300 bg-amber-50 text-amber-800"
      : "border-emerald-300 bg-emerald-50 text-emerald-800";
  const bannerText = failCount
    ? `❌ ${failCount} validation errors must be resolved`
    : warningCount
      ? `⚠ Validation passed with ${warningCount} warnings`
      : "✅ All checks passed - ready to generate filing";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Validation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className={`rounded border px-3 py-2 text-sm font-medium ${bannerClass}`}>
          Score: {result.score}% - {bannerText}
        </div>

        <div className="space-y-2">
          {groupedChecks.map(([category, checks]) => {
            const passed = checks.filter((check) => check.status === "pass").length;
            const nonPassed = checks.length - passed;
            const isOpen = open[category] ?? false;
            return (
              <div key={category} className="rounded border border-slate-200">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm"
                  onClick={() =>
                    setOpen((state) => ({
                      ...state,
                      [category]: !isOpen,
                    }))
                  }
                >
                  <span className="font-medium">
                    {categoryLabels[category] ?? category} ({passed}/{checks.length})
                  </span>
                  <span className={nonPassed > 0 ? "text-danger" : "text-emerald-700"}>
                    {nonPassed > 0 ? `${nonPassed} issues` : "All pass"}
                  </span>
                </button>
                {isOpen ? (
                  <div className="space-y-2 border-t border-slate-200 px-3 py-2">
                    {checks.map((check) => (
                      <div key={check.id} className="rounded border border-slate-100 p-2">
                        <p className="text-sm font-medium text-slate-900">
                          {check.status === "pass"
                            ? "✅"
                            : check.status === "warning"
                              ? "⚠️"
                              : "❌"}{" "}
                          {check.label}
                        </p>
                        <p className="text-xs text-slate-600">{check.description}</p>
                        {check.message ? (
                          <p
                            className={`mt-1 text-xs ${
                              check.status === "fail" ? "text-danger" : "text-amber-700"
                            }`}
                          >
                            {check.message}
                          </p>
                        ) : null}
                        {check.tab ? (
                          <p className="mt-1 text-xs font-medium text-accent">
                            Go to {check.tab} →
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
