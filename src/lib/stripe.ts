import Stripe from "stripe";
import type { Plan } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is required");
    }
    stripeInstance = new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
  }
  return stripeInstance;
}

export type PlanId = Plan;

export interface PlanConfig {
  name: string;
  priceMonthly: number;
  stripePriceId: string;
  transactionLimit: number;
  userLimit: number;
  hasAiExtraction: boolean;
  hasApiAccess: boolean;
  trialDays: number;
}

export const PLAN_CONFIG: Record<PlanId, PlanConfig> = {
  STARTER: {
    name: "Starter",
    priceMonthly: 199,
    stripePriceId: process.env.STRIPE_PRICE_STARTER || "price_starter_placeholder",
    transactionLimit: 25,
    userLimit: 2,
    hasAiExtraction: false,
    hasApiAccess: false,
    trialDays: 14,
  },
  PROFESSIONAL: {
    name: "Professional",
    priceMonthly: 499,
    stripePriceId:
      process.env.STRIPE_PRICE_PROFESSIONAL || "price_professional_placeholder",
    transactionLimit: 100,
    userLimit: 10,
    hasAiExtraction: true,
    hasApiAccess: false,
    trialDays: 14,
  },
  ENTERPRISE: {
    name: "Enterprise",
    priceMonthly: 999,
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE || "price_enterprise_placeholder",
    transactionLimit: -1,
    userLimit: -1,
    hasAiExtraction: true,
    hasApiAccess: true,
    trialDays: 14,
  },
  PAY_PER_FILE: {
    name: "Per-File",
    priceMonthly: 29,
    stripePriceId: process.env.STRIPE_PRICE_PER_FILE || "price_per_file_placeholder",
    transactionLimit: -1,
    userLimit: 1,
    hasAiExtraction: false,
    hasApiAccess: false,
    trialDays: 14,
  },
};

export async function createStripeCustomer(
  orgId: string,
  orgName: string,
  email: string,
): Promise<{ customerId: string }> {
  const stripe = getStripe();

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { stripe_customer_id: true },
  });

  if (org?.stripe_customer_id) {
    return { customerId: org.stripe_customer_id };
  }

  const customer = await stripe.customers.create({
    name: orgName,
    email,
    metadata: { org_id: orgId },
  });

  await prisma.organization.update({
    where: { id: orgId },
    data: { stripe_customer_id: customer.id },
  });

  return { customerId: customer.id };
}

export async function createCheckoutSession(options: {
  orgId: string;
  customerId: string | null;
  planId: PlanId;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripe();
  const plan = PLAN_CONFIG[options.planId];
  if (!plan) {
    throw new Error(`Invalid plan: ${options.planId}`);
  }

  let customerId = options.customerId;
  if (!customerId) {
    const org = await prisma.organization.findUnique({
      where: { id: options.orgId },
      select: { name: true, company_email: true },
    });
    if (!org) {
      throw new Error("Organization not found");
    }
    const created = await createStripeCustomer(
      options.orgId,
      org.name,
      org.company_email || "billing@titlecomply.com",
    );
    customerId = created.customerId;
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    mode: options.planId === "PAY_PER_FILE" ? "payment" : "subscription",
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
    metadata: { org_id: options.orgId, plan_id: options.planId },
  };

  if (options.planId !== "PAY_PER_FILE" && plan.trialDays > 0) {
    sessionParams.subscription_data = {
      trial_period_days: plan.trialDays,
      metadata: { org_id: options.orgId, plan_id: options.planId },
    };
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL");
  }

  return { url: session.url, sessionId: session.id };
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<{ url: string }> {
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return { url: session.url };
}

export async function changeSubscriptionPlan(
  orgId: string,
  newPlanId: PlanId,
): Promise<{ planId: PlanId; subscriptionId: string | null }> {
  const stripe = getStripe();
  const newPlan = PLAN_CONFIG[newPlanId];
  if (!newPlan) {
    throw new Error(`Invalid plan: ${newPlanId}`);
  }

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { stripe_subscription_id: true },
  });

  if (!org?.stripe_subscription_id) {
    throw new Error("No active subscription. Start a subscription first via checkout.");
  }

  const subscription = await stripe.subscriptions.retrieve(org.stripe_subscription_id);
  const currentItem = subscription.items.data[0];
  if (!currentItem) {
    throw new Error("No subscription items found");
  }

  await stripe.subscriptions.update(org.stripe_subscription_id, {
    items: [{ id: currentItem.id, price: newPlan.stripePriceId }],
    proration_behavior: "create_prorations",
    metadata: { org_id: orgId, plan_id: newPlanId },
  });

  await prisma.organization.update({
    where: { id: orgId },
    data: {
      plan: newPlanId,
      monthly_transaction_limit:
        newPlan.transactionLimit === -1 ? 999999 : newPlan.transactionLimit,
    },
  });

  return { planId: newPlanId, subscriptionId: org.stripe_subscription_id };
}

export async function cancelSubscription(
  orgId: string,
): Promise<{ cancelledImmediately: boolean; message: string }> {
  const stripe = getStripe();

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { stripe_subscription_id: true },
  });

  if (!org?.stripe_subscription_id) {
    return { cancelledImmediately: false, message: "No active subscription" };
  }

  const subscription = await stripe.subscriptions.retrieve(org.stripe_subscription_id);
  const inTrial = subscription.status === "trialing";

  if (inTrial) {
    await stripe.subscriptions.cancel(org.stripe_subscription_id);
    await prisma.organization.update({
      where: { id: orgId },
      data: {
        plan: "STARTER",
        stripe_subscription_id: null,
        trial_ends_at: new Date(),
      },
    });
    return {
      cancelledImmediately: true,
      message: "Trial cancelled. Access has been revoked.",
    };
  }

  await stripe.subscriptions.update(org.stripe_subscription_id, {
    cancel_at_period_end: true,
  });

  return {
    cancelledImmediately: false,
    message: "Subscription will cancel at the end of the billing period.",
  };
}

export async function canCreateTransaction(orgId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  message?: string;
}> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      monthly_transaction_count: true,
      monthly_transaction_limit: true,
    },
  });

  if (!org) {
    return {
      allowed: false,
      current: 0,
      limit: 0,
      message: "Organization not found",
    };
  }

  const limit = org.monthly_transaction_limit;
  const current = org.monthly_transaction_count;
  if (limit >= 999999 || limit === -1) {
    return { allowed: true, current, limit };
  }

  if (current >= limit) {
    return {
      allowed: false,
      current,
      limit,
      message: `Monthly transaction limit reached (${current}/${limit}). Upgrade your plan for more.`,
    };
  }

  return { allowed: true, current, limit };
}

export async function canInviteTeamMember(orgId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  message?: string;
}> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { plan: true },
  });

  if (!org) {
    return {
      allowed: false,
      current: 0,
      limit: 0,
      message: "Organization not found",
    };
  }

  const plan = PLAN_CONFIG[org.plan];
  if (!plan) {
    return { allowed: false, current: 0, limit: 0, message: "Invalid plan" };
  }

  const userCount = await prisma.user.count({ where: { org_id: orgId } });
  const limit = plan.userLimit === -1 ? 999999 : plan.userLimit;

  if (userCount >= limit) {
    return {
      allowed: false,
      current: userCount,
      limit,
      message: `Team member limit reached (${userCount}/${limit}). Upgrade your plan.`,
    };
  }

  return { allowed: true, current: userCount, limit };
}

export function planHasAiExtraction(plan: PlanId): boolean {
  const config = PLAN_CONFIG[plan];
  return config?.hasAiExtraction ?? false;
}

export async function incrementTransactionCount(orgId: string): Promise<void> {
  await prisma.organization.update({
    where: { id: orgId },
    data: { monthly_transaction_count: { increment: 1 } },
  });
}
