import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import type { OfacScreeningResult } from "@/lib/ofac";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { OfacClient } from "./ofac-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "OFAC Screening",
};

export default async function TransactionOfacPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) redirect("/sign-in");
  const { organization } = await resolveUser();
  const { id } = await params;

  const transaction = await prisma.transaction.findFirst({
    where: { id, org_id: organization.id },
    select: { id: true, data_collection: true },
  });
  if (!transaction) notFound();
  const data =
    transaction.data_collection && typeof transaction.data_collection === "object"
      ? (transaction.data_collection as Record<string, unknown>)
      : {};
  const initialResult = (data.ofac as OfacScreeningResult | undefined) ?? null;

  return <OfacClient transactionId={transaction.id} initialResult={initialResult} />;
}
