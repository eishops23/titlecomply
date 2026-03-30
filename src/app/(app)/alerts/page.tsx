import { prisma } from "@/lib/db";
import { AlertsClient, type AlertListItem } from "./alerts-client";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const alerts = await prisma.alert.findMany({
    orderBy: [{ acknowledged: "asc" }, { created_at: "desc" }],
    include: {
      transaction: {
        select: {
          id: true,
          file_number: true,
          property_address: true,
          property_city: true,
          property_state: true,
        },
      },
    },
  });

  return (
    <div className="p-6">
      <AlertsClient alerts={alerts as AlertListItem[]} />
    </div>
  );
}
