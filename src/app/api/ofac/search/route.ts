import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { searchOfac } from "@/lib/ofac";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ name: z.string().trim().min(2).max(200) });
const WINDOW_MS = 60_000;
const LIMIT = 10;
const rateMap = new Map<string, number[]>();

function getIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function rateLimitOk(ip: string): boolean {
  const now = Date.now();
  const recent = (rateMap.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) return false;
  recent.push(now);
  rateMap.set(ip, recent);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip = getIp(request);
    if (!rateLimitOk(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
    const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
    }
    const result = await searchOfac(parsed.data.name);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "OFAC search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
