import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { resolveUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId, orgId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  if (!orgId) {
    redirect("/sign-in");
  }

  const { organization } = await resolveUser();
  const data = await getDashboardData(organization.id);

  return (
    <DashboardContent
      activeTransactions={data.activeTransactions}
      requiringAction={data.requiringAction}
      overdueItems={data.overdueItems}
      complianceScore={data.complianceScore}
      pipeline={data.pipeline}
      recentAuditLogs={data.recentAuditLogs}
      alerts={data.alerts}
      filingsThisMonth={data.filingsThisMonth}
      planLimit={data.planLimit}
    />
  );
}
