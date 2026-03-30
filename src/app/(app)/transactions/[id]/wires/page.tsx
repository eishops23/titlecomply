import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import type { WireInstruction } from "@/lib/wire-fraud";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { WiresClient } from "./wires-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wire Verification",
};

export default async function TransactionWiresPage({
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
  const data = transaction.data_collection && typeof transaction.data_collection === "object"
    ? (transaction.data_collection as Record<string, unknown>)
    : {};
  const wires = Array.isArray(data.wires) ? (data.wires as WireInstruction[]) : [];
  return <WiresClient transactionId={transaction.id} initialWires={wires} />;
}
