import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { resolveUser } from "@/lib/auth";
import { createStripeCustomer } from "@/lib/stripe";

export const dynamic = "force-dynamic";

const customerSchema = z.object({
  orgName: z.string().trim().min(1),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const { organization } = await resolveUser();
    const body = await request.json();
    const parsed = customerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { customerId } = await createStripeCustomer(
      organization.id,
      parsed.data.orgName,
      parsed.data.email,
    );

    return NextResponse.json({ customerId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Customer creation failed";
    const status =
      message === "Unauthorized" || message === "Organization required" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
