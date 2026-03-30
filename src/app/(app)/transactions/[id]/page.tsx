import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import { TransactionDetail } from "./transaction-detail";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Transaction",
};

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    redirect("/sign-in");
  }
  const { id } = await params;

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      organization: true,
      entity_detail: true,
      trust_detail: true,
      beneficial_owners: true,
      documents: { orderBy: { created_at: "desc" } },
      filings: { orderBy: { created_at: "desc" } },
      assigned_to: true,
      created_by: true,
    },
  });

  // Org isolation check — uncomment once Clerk org resolution is finalized here.
  // const { organization } = await resolveUser();
  // if (!transaction || transaction.org_id !== organization.id) {
  //   notFound();
  // }

  if (!transaction) {
    notFound();
  }

  return <TransactionDetail transaction={transaction} />;
}
