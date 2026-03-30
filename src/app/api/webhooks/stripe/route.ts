import Stripe from "stripe";
import { NextResponse, type NextRequest } from "next/server";
import { AlertSeverity, AlertType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { getStripe, PLAN_CONFIG, type PlanId } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 },
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("[stripe/webhook] Signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.metadata?.org_id;
        const planId = session.metadata?.plan_id as PlanId | undefined;

        if (orgId && planId && PLAN_CONFIG[planId]) {
          const plan = PLAN_CONFIG[planId];
          const updateData: {
            plan: PlanId;
            stripe_customer_id: string;
            monthly_transaction_limit: number;
            stripe_subscription_id?: string;
            trial_ends_at?: Date;
          } = {
            plan: planId,
            stripe_customer_id: String(session.customer),
            monthly_transaction_limit:
              plan.transactionLimit === -1 ? 999999 : plan.transactionLimit,
          };

          if (session.subscription) {
            updateData.stripe_subscription_id = String(session.subscription);
          }

          if (plan.trialDays > 0 && planId !== "PAY_PER_FILE") {
            updateData.trial_ends_at = new Date(
              Date.now() + plan.trialDays * 24 * 60 * 60 * 1000,
            );
          }

          await prisma.organization.update({
            where: { id: orgId },
            data: updateData,
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const orgId = subscription.metadata?.org_id;
        if (!orgId) {
          break;
        }

        const priceId = subscription.items.data[0]?.price?.id;
        if (!priceId) {
          break;
        }

        const matchedPlan = (
          Object.entries(PLAN_CONFIG) as Array<[PlanId, (typeof PLAN_CONFIG)[PlanId]]>
        ).find(([, config]) => config.stripePriceId === priceId);

        if (matchedPlan) {
          const [planId, planConfig] = matchedPlan;
          await prisma.organization.update({
            where: { id: orgId },
            data: {
              plan: planId,
              monthly_transaction_limit:
                planConfig.transactionLimit === -1
                  ? 999999
                  : planConfig.transactionLimit,
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const orgId = subscription.metadata?.org_id;
        if (!orgId) {
          break;
        }

        await prisma.organization.update({
          where: { id: orgId },
          data: {
            plan: "STARTER",
            stripe_subscription_id: null,
            monthly_transaction_limit: 25,
          },
        });

        await prisma.alert.create({
          data: {
            org_id: orgId,
            type: AlertType.SUBSCRIPTION_EXPIRING,
            severity: AlertSeverity.HIGH,
            title: "Subscription Cancelled",
            message:
              "Your subscription has been cancelled. You have been moved to the Starter plan with limited features. Upgrade anytime to restore full access.",
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = String(invoice.customer ?? "");
        if (!customerId) {
          break;
        }

        const org = await prisma.organization.findFirst({
          where: { stripe_customer_id: customerId },
          select: { id: true },
        });

        if (org) {
          await prisma.alert.create({
            data: {
              org_id: org.id,
              type: AlertType.SUBSCRIPTION_EXPIRING,
              severity: AlertSeverity.CRITICAL,
              title: "Payment Failed",
              message:
                "Your most recent payment has failed. Please update your payment method in billing settings to avoid service interruption.",
            },
          });
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe/webhook] Error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
