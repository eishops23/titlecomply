import crypto from "node:crypto";
import type { Prisma } from "@/generated/prisma/client";
import { AlertSeverity, AlertType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";

const FINCEN_ECFR_URL =
  "https://www.ecfr.gov/api/versioner/v1/full/current/title-31.json?part=1031";
const FINCEN_RULE_PAGE = "https://www.fincen.gov/real-estate";

export interface MonitorResult {
  changed: boolean;
  lastChecked: string;
  currentHash: string;
  previousHash: string | null;
  source: string;
  alertsCreated: number;
  error?: string;
}

export async function checkForFinCENUpdates(): Promise<MonitorResult> {
  const now = new Date().toISOString();
  let source = "ecfr";
  let responseText = "";

  try {
    const ecfrResponse = await fetch(FINCEN_ECFR_URL, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });

    if (ecfrResponse.ok) {
      responseText = await ecfrResponse.text();
    } else {
      source = "fincen.gov";
      const fincenResponse = await fetch(FINCEN_RULE_PAGE, {
        signal: AbortSignal.timeout(15000),
      });

      if (!fincenResponse.ok) {
        return {
          changed: false,
          lastChecked: now,
          currentHash: "",
          previousHash: null,
          source,
          alertsCreated: 0,
          error: `Both eCFR and FinCEN.gov unreachable (status: ${ecfrResponse.status}, ${fincenResponse.status})`,
        };
      }

      responseText = await fincenResponse.text();
    }
  } catch (fetchError) {
    return {
      changed: false,
      lastChecked: now,
      currentHash: "",
      previousHash: null,
      source,
      alertsCreated: 0,
      error: `Fetch failed: ${fetchError instanceof Error ? fetchError.message : "Unknown error"}`,
    };
  }

  const currentHash = crypto.createHash("sha256").update(responseText).digest("hex");
  const previousEntry = await prisma.auditLog.findFirst({
    where: { action: "system.fincen_monitor" },
    orderBy: { created_at: "desc" },
  });

  const previousDetails =
    previousEntry?.details && typeof previousEntry.details === "object" && !Array.isArray(previousEntry.details)
      ? (previousEntry.details as Record<string, unknown>)
      : null;
  const previousHash = typeof previousDetails?.hash === "string" ? previousDetails.hash : null;
  const changed = previousHash !== null && previousHash !== currentHash;
  let alertsCreated = 0;

  if (changed) {
    const organizations = await prisma.organization.findMany({ select: { id: true } });
    for (const org of organizations) {
      await prisma.alert.create({
        data: {
          org_id: org.id,
          type: AlertType.REGULATION_UPDATE,
          severity: AlertSeverity.HIGH,
          title: "FinCEN Rule 31 CFR Part 1031 Updated",
          message:
            "A change has been detected in FinCEN's Real Estate Report rule (31 CFR Part 1031). " +
            "This may affect your compliance requirements. Please review the updated rule at " +
            "https://www.ecfr.gov/current/title-31/part-1031 and consult with your compliance counsel. " +
            `Detected on ${new Date().toLocaleDateString("en-US")}.`,
        },
      });
      alertsCreated += 1;
    }
  }

  const systemOrg = await prisma.organization.findFirst({ select: { id: true } });
  if (systemOrg) {
    const details: Prisma.InputJsonObject = {
      hash: currentHash,
      source,
      changed,
      previous_hash: previousHash,
      response_length: responseText.length,
      alerts_created: alertsCreated,
    };
    await prisma.auditLog.create({
      data: {
        org_id: systemOrg.id,
        action: "system.fincen_monitor",
        details,
        current_hash: crypto
          .createHash("sha256")
          .update(`${previousHash || ""}system.fincen_monitor${currentHash}${now}`)
          .digest("hex"),
        previous_hash: previousEntry?.current_hash || null,
      },
    });
  }

  return {
    changed,
    lastChecked: now,
    currentHash,
    previousHash,
    source,
    alertsCreated,
  };
}

export async function getLastMonitorCheck(): Promise<{
  lastChecked: string | null;
  lastHash: string | null;
  totalChecks: number;
  lastChanged: string | null;
}> {
  const lastEntry = await prisma.auditLog.findFirst({
    where: { action: "system.fincen_monitor" },
    orderBy: { created_at: "desc" },
  });

  const totalChecks = await prisma.auditLog.count({
    where: { action: "system.fincen_monitor" },
  });

  const lastChanged = await prisma.auditLog.findFirst({
    where: {
      action: "system.fincen_monitor",
      details: { path: ["changed"], equals: true },
    },
    orderBy: { created_at: "desc" },
  });

  const details =
    lastEntry?.details && typeof lastEntry.details === "object" && !Array.isArray(lastEntry.details)
      ? (lastEntry.details as Record<string, unknown>)
      : null;

  return {
    lastChecked: lastEntry?.created_at.toISOString() || null,
    lastHash: typeof details?.hash === "string" ? details.hash : null,
    totalChecks,
    lastChanged: lastChanged?.created_at.toISOString() || null,
  };
}
