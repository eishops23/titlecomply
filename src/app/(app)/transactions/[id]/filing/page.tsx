import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { resolveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FilingClient } from "./filing-client";

export const dynamic = "force-dynamic";

export default async function TransactionFilingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    redirect("/sign-in");
  }

  const { organization } = await resolveUser();
  const { id } = await params;

  const transaction = await prisma.transaction.findFirst({
    where: { id, org_id: organization.id },
    include: {
      entity_detail: true,
      trust_detail: true,
      beneficial_owners: true,
      organization: true,
      filings: {
        orderBy: { created_at: "desc" },
      },
    },
  });

  if (!transaction) {
    notFound();
  }

  return (
    <div className="p-6">
      <FilingClient transaction={transaction} />
    </div>
  );
}
