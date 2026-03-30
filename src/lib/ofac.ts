import crypto from "node:crypto";
import { getCachedSdnEntries } from "@/lib/ofac-sdn-data";

export interface OfacScreeningResult {
  id: string;
  screenedAt: string;
  parties: OfacPartyResult[];
  overallStatus: "CLEAR" | "POTENTIAL_MATCH" | "MATCH" | "ERROR";
  certificateId: string;
}

export interface OfacPartyResult {
  partyName: string;
  partyRole: "buyer" | "seller" | "beneficial_owner" | "entity" | "trustee" | "grantor";
  status: "CLEAR" | "POTENTIAL_MATCH" | "MATCH" | "ERROR";
  matches: OfacMatch[];
  screenedAt: string;
}

export interface OfacMatch {
  sdnName: string;
  sdnType: string;
  score: number;
  programs: string[];
  remarks: string;
  uid: string;
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function similarityScore(a: string, b: string): number {
  const aa = normalize(a);
  const bb = normalize(b);
  if (!aa || !bb) return 0;
  if (aa === bb) return 100;
  if (aa.includes(bb) || bb.includes(aa)) return 95;

  const aTokens = new Set(aa.split(" "));
  const bTokens = new Set(bb.split(" "));
  const shared = [...aTokens].filter((token) => bTokens.has(token)).length;
  const max = Math.max(aTokens.size, bTokens.size) || 1;
  return Math.round((shared / max) * 100);
}

export async function searchOfac(name: string): Promise<{
  status: "CLEAR" | "POTENTIAL_MATCH" | "MATCH" | "ERROR";
  matches: OfacMatch[];
}> {
  const trimmed = name.trim();
  if (trimmed.length < 2) return { status: "CLEAR", matches: [] };

  const apiKey = process.env.OFAC_API_KEY;
  if (apiKey) {
    try {
      const response = await fetch("https://api.ofac-api.com/v4/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ name: trimmed, minScore: 80 }),
        signal: AbortSignal.timeout(10000),
      });
      if (response.ok) {
        const data = (await response.json()) as {
          results?: Array<{
            name?: string;
            type?: string;
            score?: number;
            programs?: string[];
            remarks?: string;
            uid?: string;
          }>;
        };
        const matches = (data.results ?? []).map((r) => ({
          sdnName: r.name ?? "",
          sdnType: r.type ?? "Entity",
          score: Number(r.score ?? 0),
          programs: r.programs ?? [],
          remarks: r.remarks ?? "",
          uid: r.uid ?? "",
        }));
        return resolveStatus(matches);
      }
    } catch (error) {
      console.warn("[ofac] API lookup failed, using fallback", error);
    }
  }

  return searchOfacFallback(trimmed);
}

async function searchOfacFallback(name: string): Promise<{
  status: "CLEAR" | "POTENTIAL_MATCH" | "MATCH" | "ERROR";
  matches: OfacMatch[];
}> {
  try {
    const entries = await getCachedSdnEntries();
    const matches = entries
      .map((entry) => ({
        sdnName: entry.name,
        sdnType: entry.type,
        score: similarityScore(name, entry.name),
        programs: entry.programs,
        remarks: entry.remarks,
        uid: entry.uid,
      }))
      .filter((m) => m.score >= 80)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    return resolveStatus(matches);
  } catch (error) {
    console.error("[ofac] fallback failed", error);
    return { status: "ERROR", matches: [] };
  }
}

function resolveStatus(matches: OfacMatch[]) {
  if (matches.length === 0) return { status: "CLEAR" as const, matches };
  const hasMatch = matches.some((m) => m.score >= 95);
  const hasPotential = matches.some((m) => m.score >= 80);
  return {
    status: hasMatch ? ("MATCH" as const) : hasPotential ? ("POTENTIAL_MATCH" as const) : ("CLEAR" as const),
    matches,
  };
}

export async function screenTransactionParties(transaction: {
  id: string;
  entity_detail?: { entity_name: string } | null;
  trust_detail?: { trust_name: string; trustee_name?: string | null; grantor_name?: string | null } | null;
  beneficial_owners: Array<{ first_name: string; last_name: string }>;
  data_collection?: { seller_name?: string; seller?: { name?: string } } | null;
}): Promise<OfacScreeningResult> {
  const parties: OfacPartyResult[] = [];
  const screenedAt = new Date().toISOString();

  const pushResult = async (
    partyName: string | null | undefined,
    partyRole: OfacPartyResult["partyRole"],
  ) => {
    if (!partyName?.trim()) return;
    const result = await searchOfac(partyName);
    parties.push({
      partyName,
      partyRole,
      status: result.status,
      matches: result.matches,
      screenedAt,
    });
  };

  await pushResult(transaction.entity_detail?.entity_name, "entity");
  if (transaction.trust_detail) {
    await pushResult(transaction.trust_detail.trust_name, "entity");
    await pushResult(transaction.trust_detail.trustee_name, "trustee");
    await pushResult(transaction.trust_detail.grantor_name, "grantor");
  }
  for (const bo of transaction.beneficial_owners) {
    await pushResult(`${bo.first_name} ${bo.last_name}`.trim(), "beneficial_owner");
  }
  await pushResult(
    transaction.data_collection?.seller?.name ?? transaction.data_collection?.seller_name,
    "seller",
  );

  const hasMatch = parties.some((p) => p.status === "MATCH");
  const hasPotential = parties.some((p) => p.status === "POTENTIAL_MATCH");
  const hasError = parties.some((p) => p.status === "ERROR");
  const overallStatus = hasMatch
    ? "MATCH"
    : hasPotential
      ? "POTENTIAL_MATCH"
      : hasError
        ? "ERROR"
        : "CLEAR";

  return {
    id: crypto.randomUUID(),
    screenedAt,
    parties,
    overallStatus,
    certificateId: `OFAC-${new Date().getFullYear()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
  };
}
