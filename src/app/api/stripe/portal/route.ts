import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { resolveUser } from "@/lib/auth";
import { createBillingPortalSession } from "@/lib/stripe";

export const dynamic = "force-dynamic";

const portalSchema = z.object({
  returnUrl: z.string().url(),
});

export async function POST(request: NextRequest) {
  try {
    const { organization } = await resolveUser();
    const body = await request.json();
    const parsed = portalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (!organization.stripe_customer_id) {
      return NextResponse.json(
        { error: "No billing customer. Start a subscription first." },
        { status: 400 },
      );
    }

    const { url } = await createBillingPortalSession(
      organization.stripe_customer_id,
      parsed.data.returnUrl,
    );
    return NextResponse.json({ url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Portal session creation failed";
    const status =
      message === "Unauthorized" || message === "Organization required" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
