type TreasurySdnEntry = {
  uid: string;
  name: string;
  type: string;
  programs: string[];
  remarks: string;
};

const SDN_XML_URL =
  "https://sanctionslistservice.ofac.treas.gov/api/PublicationPreview/exports/SDN.XML";
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;

let cache: { entries: TreasurySdnEntry[]; fetchedAt: number } | null = null;

function parseXmlEntries(xml: string): TreasurySdnEntry[] {
  const entries: TreasurySdnEntry[] = [];
  const entryRegex = /<sdnEntry>([\s\S]*?)<\/sdnEntry>/g;
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(xml)) !== null) {
    const block = match[1];
    const uid = (block.match(/<uid>(.*?)<\/uid>/)?.[1] ?? "").trim();
    const firstName = (block.match(/<firstName>(.*?)<\/firstName>/)?.[1] ?? "").trim();
    const lastName = (block.match(/<lastName>(.*?)<\/lastName>/)?.[1] ?? "").trim();
    const type = (block.match(/<sdnType>(.*?)<\/sdnType>/)?.[1] ?? "Entity").trim();
    const remarks = (block.match(/<remarks>(.*?)<\/remarks>/)?.[1] ?? "").trim();
    const programMatches = block.matchAll(/<program>(.*?)<\/program>/g);
    const programs = [...programMatches].map((m) => m[1]?.trim() ?? "").filter(Boolean);
    const name = `${firstName} ${lastName}`.trim();

    if (name) {
      entries.push({ uid, name, type, programs, remarks });
    }
  }

  return entries;
}

export async function getCachedSdnEntries(): Promise<TreasurySdnEntry[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.entries;
  }

  const response = await fetch(SDN_XML_URL, {
    headers: { Accept: "application/xml,text/xml" },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch SDN XML (${response.status})`);
  }

  const xml = await response.text();
  const entries = parseXmlEntries(xml);
  cache = { entries, fetchedAt: Date.now() };
  return entries;
}
