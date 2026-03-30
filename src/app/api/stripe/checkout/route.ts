import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { resolveUser } from "@/lib/auth";
import { createCheckoutSession, type PlanId } from "@/lib/stripe";

export const dynamic = "force-dynamic";

const checkoutSchema = z.object({
  planId: z.enum(["STARTER", "PROFESSIONAL", "ENTERPRISE", "PAY_PER_FILE"]),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export async function POST(request: NextRequest) {
  try {
    const { organization } = await resolveUser();
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { planId, successUrl, cancelUrl } = parsed.data;
    const { url, sessionId } = await createCheckoutSession({
      orgId: organization.id,
      customerId: organization.stripe_customer_id,
      planId: planId as PlanId,
      successUrl,
      cancelUrl,
    });

    return NextResponse.json({ url, sessionId });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Checkout session creation failed";
    const status =
      message === "Unauthorized" || message === "Organization required" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
