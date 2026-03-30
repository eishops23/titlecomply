"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLAN_PRICING, PLAN_USER_LIMITS, PLANS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type BillingOrg = {
  plan: "STARTER" | "PROFESSIONAL" | "ENTERPRISE" | "PAY_PER_FILE";
  monthly_transaction_count: number;
  trial_ends_at: Date | string | null;
  stripe_customer_id?: string | null;
  users: { id: string }[];
};

function usageColorClass(percent: number): string {
  if (percent >= 100) return "bg-red-500";
  if (percent >= 80) return "bg-amber-500";
  return "bg-emerald-500";
}

export function BillingClient({ organization }: { organization: BillingOrg | null }) {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const cancelled = searchParams.get("cancelled");
  const [isLoading, setIsLoading] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  useEffect(() => {
    if (success) {
      setBannerMessage("Subscription activated!");
      return;
    }
    if (cancelled) {
      setBannerMessage("Checkout cancelled.");
      return;
    }
    setBannerMessage(null);
  }, [success, cancelled]);

  async function handleUpgrade(planId: BillingOrg["plan"]) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          successUrl: `${window.location.origin}/settings/billing?success=true`,
          cancelUrl: `${window.location.origin}/settings/billing?cancelled=true`,
        }),
      });
      const data = (await res.json()) as { url?: string };
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleManageBilling() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/settings/billing`,
        }),
      });
      const data = (await res.json()) as { url?: string };
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (!organization) {
    return <p className="text-sm text-muted">Organization not found.</p>;
  }

  const currentPlan = PLAN_PRICING[organization.plan];
  const txnLimit = PLANS[organization.plan].monthlyTransactionLimit;
  const userLimit = PLAN_USER_LIMITS[organization.plan];
  const txnPercent =
    txnLimit && Number.isFinite(txnLimit)
      ? Math.min(100, Math.round((organization.monthly_transaction_count / txnLimit) * 100))
      : 0;
  const userPercent = Number.isFinite(userLimit)
    ? Math.min(100, Math.round((organization.users.length / userLimit) * 100))
    : 0;

  let trialLabel = "";
  if (organization.trial_ends_at) {
    const trialDate = new Date(organization.trial_ends_at);
    const daysRemaining = Math.ceil((trialDate.getTime() - Date.now()) / 86400000);
    trialLabel = daysRemaining > 0 ? `Trial: Active — ${daysRemaining} days remaining` : "Trial expired";
  }

  return (
    <div className="space-y-4">
      {bannerMessage ? (
        <Card>
          <CardContent className="py-3">
            <p className="text-sm text-foreground">{bannerMessage}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-foreground">{organization.plan}</h2>
              <Badge className="bg-blue-50 text-blue-800 ring-blue-200">Active</Badge>
            </div>
            <p className="text-sm font-medium text-foreground">{currentPlan.priceLabel}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-foreground">
              Transactions: {organization.monthly_transaction_count} of{" "}
              {txnLimit ?? "Unlimited"} used
            </p>
            <div className="h-2 w-full overflow-hidden rounded bg-slate-200">
              <div
                className={cn("h-full", usageColorClass(txnPercent))}
                style={{ width: `${txnPercent}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-foreground">
              Team members: {organization.users.length} of{" "}
              {Number.isFinite(userLimit) ? userLimit : "Unlimited"} used
            </p>
            <div className="h-2 w-full overflow-hidden rounded bg-slate-200">
              <div
                className={cn("h-full", usageColorClass(userPercent))}
                style={{ width: `${userPercent}%` }}
              />
            </div>
          </div>

          {trialLabel ? <p className="text-sm text-muted">{trialLabel}</p> : null}

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => handleUpgrade("PROFESSIONAL")}
              disabled={isLoading}
            >
              Upgrade Plan
            </Button>
            <Button
              variant="secondary"
              onClick={handleManageBilling}
              disabled={isLoading || !organization.stripe_customer_id}
            >
              Manage Billing
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(PLAN_PRICING).map(([planId, plan]) => {
            const isCurrent = planId === organization.plan;
            const typedPlanId = planId as BillingOrg["plan"];
            return (
              <div
                key={planId}
                className={cn(
                  "rounded-md border p-3",
                  isCurrent ? "border-accent bg-blue-50/40" : "border-slate-200",
                )}
              >
                <p className="font-semibold text-foreground">{plan.name}</p>
                <p className="mt-1 text-sm text-muted">{plan.priceLabel}</p>
                <p className="mt-2 text-xs text-muted">Transactions: {plan.transactions}</p>
                <p className="text-xs text-muted">Users: {plan.users}</p>
                <p className="mt-2 text-xs text-muted">{plan.features[1] ?? plan.features[0]}</p>
                <div className="mt-3">
                  {isCurrent ? (
                    <Button size="sm" variant="secondary" disabled>
                      Current
                    </Button>
                  ) : planId === "ENTERPRISE" ? (
                    <Link href="/contact">
                      <Button size="sm" variant="secondary">
                        Contact
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={isLoading}
                      onClick={() => handleUpgrade(typedPlanId)}
                    >
                      Upgrade
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted">
            Invoice history will be available once billing is configured.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
