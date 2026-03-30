import { prisma } from "@/lib/db";
import { FilingsClient, type FilingListItem } from "./filings-client";

export const dynamic = "force-dynamic";

export default async function FilingsPage() {
  const filings = await prisma.filing.findMany({
    orderBy: { created_at: "desc" },
    include: {
      transaction: {
        select: {
          id: true,
          file_number: true,
          property_address: true,
          property_city: true,
          property_state: true,
          property_zip: true,
        },
      },
    },
  });

  return (
    <div className="p-6">
      <FilingsClient filings={filings as FilingListItem[]} />
    </div>
  );
}
