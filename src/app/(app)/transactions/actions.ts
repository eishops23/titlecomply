"use server";

import { revalidatePath } from "next/cache";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { TransactionStatus } from "@/generated/prisma/enums";

async function assertOrgTransactions(ids: string[], orgId: string) {
  const found = await prisma.transaction.findMany({
    where: { id: { in: ids }, org_id: orgId },
    select: { id: true },
  });
  if (found.length !== ids.length) {
    throw new Error("One or more transactions were not found");
  }
}

export async function bulkUpdateTransactionStatus(
  ids: string[],
  status: TransactionStatus,
) {
  const { organization } = await resolveUser();
  if (ids.length === 0) return { updated: 0 };
  await assertOrgTransactions(ids, organization.id);

  const result = await prisma.transaction.updateMany({
    where: { id: { in: ids }, org_id: organization.id },
    data: { status },
  });

  revalidatePath("/transactions");
  return { updated: result.count };
}

export async function bulkAssignTransactions(
  ids: string[],
  assignedToId: string | null,
) {
  const { organization } = await resolveUser();
  if (ids.length === 0) return { updated: 0 };

  if (assignedToId) {
    const user = await prisma.user.findFirst({
      where: { id: assignedToId, org_id: organization.id },
    });
    if (!user) {
      throw new Error("Assignee not found");
    }
  }

  await assertOrgTransactions(ids, organization.id);

  const result = await prisma.transaction.updateMany({
    where: { id: { in: ids }, org_id: organization.id },
    data: { assigned_to_id: assignedToId },
  });

  revalidatePath("/transactions");
  return { updated: result.count };
}

export async function bulkDeleteTransactions(ids: string[]) {
  const { organization } = await resolveUser();
  if (ids.length === 0) return { deleted: 0 };
  await assertOrgTransactions(ids, organization.id);

  const result = await prisma.transaction.deleteMany({
    where: { id: { in: ids }, org_id: organization.id },
  });

  revalidatePath("/transactions");
  return { deleted: result.count };
}
