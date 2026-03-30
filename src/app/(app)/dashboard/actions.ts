"use server";

import { revalidatePath } from "next/cache";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function acknowledgeAlert(alertId: string) {
  const { user, organization } = await resolveUser();

  const existing = await prisma.alert.findFirst({
    where: { id: alertId, org_id: organization.id },
  });
  if (!existing) {
    throw new Error("Alert not found");
  }

  await prisma.alert.update({
    where: { id: alertId },
    data: {
      acknowledged: true,
      acknowledged_by: user.id,
      acknowledged_at: new Date(),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/alerts");
}
