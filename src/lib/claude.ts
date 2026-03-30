import Anthropic from "@anthropic-ai/sdk";
import { DocumentType } from "@/generated/prisma/enums";

const CLAUDE_MODEL = "claude-sonnet-4-20250514";
const CLAUDE_MAX_TOKENS = 4096;

export interface EntityExtractionResult {
  entity_name: string | null;
  entity_type: "LLC" | "Corporation" | "Partnership" | null;
  formation_state: string | null;
  formation_date: string | null;
  ein: string | null;
  registered_agent: {
    name: string | null;
    address: string | null;
  } | null;
  members: Array<{
    name: string | null;
    ownership_percentage: number | null;
    role: string | null;
  }>;
  principal_place_of_business: string | null;
}

export interface TrustExtractionResult {
  trust_name: string | null;
  trust_type: "Revocable" | "Irrevocable" | "Land Trust" | "Other" | null;
  trust_date: string | null;
  trustee: {
    name: string | null;
    address: string | null;
  } | null;
  grantor: {
    name: string | null;
    address: string | null;
  } | null;
  beneficiaries: Array<{
    name: string | null;
    relationship: string | null;
    percentage: number | null;
  }>;
  ein: string | null;
}

export interface GovernmentIdExtractionResult {
  full_name: string | null;
  date_of_birth: string | null;
  id_type: "drivers_license" | "passport" | "state_id" | null;
  id_number: string | null;
  issuing_state: string | null;
  issuing_country: string | null;
  expiration_date: string | null;
  address: string | null;
}

export type ExtractionResult =
  | { type: "entity"; data: EntityExtractionResult; confidence: number }
  | { type: "trust"; data: TrustExtractionResult; confidence: number }
  | {
      type: "government_id";
      data: GovernmentIdExtractionResult;
      confidence: number;
    }
  | { type: "other"; data: Record<string, unknown>; confidence: number };

const EXTRACTION_SYSTEM_PROMPT = `You are a legal document extraction specialist working for a title company compliance system. Your job is to extract structured data from uploaded documents with high accuracy.

CRITICAL RULES:
1. Extract ONLY information that is explicitly stated in the document text.
2. If a field cannot be determined from the document, set it to null — NEVER guess or fabricate.
3. Return ONLY valid JSON, no explanation, no markdown fencing, no preamble.
4. Dates should be in ISO format (YYYY-MM-DD) when possible.
5. EIN should be in XX-XXXXXXX format if found.
6. Ownership percentages should be numeric (e.g., 25 not "25%").
7. State abbreviations should be 2-letter US codes (e.g., FL not Florida).
8. After the JSON, on a new line, output a confidence score as a decimal 0.0–1.0 representing your overall confidence in the extraction accuracy.`;

function getExtractionPrompt(documentType: DocumentType, documentText: string): string {
  const entityPrompt = `Extract the following from this operating agreement / articles of organization / articles of incorporation:
{
  "entity_name": "",
  "entity_type": "LLC | Corporation | Partnership",
  "formation_state": "",
  "formation_date": "YYYY-MM-DD",
  "ein": "XX-XXXXXXX",
  "registered_agent": { "name": "", "address": "" },
  "members": [
    { "name": "", "ownership_percentage": 0, "role": "Member | Manager | Managing Member" }
  ],
  "principal_place_of_business": ""
}

Set any field to null if not found in the document.

DOCUMENT TEXT:
${documentText}`;

  const trustPrompt = `Extract the following from this trust document:
{
  "trust_name": "",
  "trust_type": "Revocable | Irrevocable | Land Trust | Other",
  "trust_date": "YYYY-MM-DD",
  "trustee": { "name": "", "address": "" },
  "grantor": { "name": "", "address": "" },
  "beneficiaries": [
    { "name": "", "relationship": "", "percentage": 0 }
  ],
  "ein": "XX-XXXXXXX"
}

Set any field to null if not found in the document.

DOCUMENT TEXT:
${documentText}`;

  const idPrompt = `Extract the following from this government-issued ID document:
{
  "full_name": "",
  "date_of_birth": "YYYY-MM-DD",
  "id_type": "drivers_license | passport | state_id",
  "id_number": "",
  "issuing_state": "",
  "issuing_country": "",
  "expiration_date": "YYYY-MM-DD",
  "address": ""
}

Set any field to null if not found in the document.

DOCUMENT TEXT / IMAGE DESCRIPTION:
${documentText}`;

  switch (documentType) {
    case DocumentType.OPERATING_AGREEMENT:
    case DocumentType.ARTICLES_OF_INCORPORATION:
    case DocumentType.ARTICLES_OF_ORGANIZATION:
    case DocumentType.CERTIFICATE_OF_GOOD_STANDING:
    case DocumentType.EIN_LETTER:
      return entityPrompt;
    case DocumentType.TRUST_DOCUMENT:
    case DocumentType.TRUST_AMENDMENT:
      return trustPrompt;
    case DocumentType.GOVERNMENT_ID:
    case DocumentType.PASSPORT:
      return idPrompt;
    default:
      return entityPrompt;
  }
}

function parseExtractionResponse(
  rawText: string,
  defaultConfidence: number,
): { data: Record<string, unknown>; confidence: number } {
  const raw = rawText.replace(/^```json?\s*|\s*```$/g, "").trim();
  const lines = raw.split("\n");
  let confidence = defaultConfidence;
  let jsonText = raw;

  const lastLine = lines[lines.length - 1]?.trim() ?? "";
  const parsedConfidence = Number.parseFloat(lastLine);
  if (
    !Number.isNaN(parsedConfidence) &&
    parsedConfidence >= 0 &&
    parsedConfidence <= 1 &&
    lines.length > 1
  ) {
    confidence = parsedConfidence;
    jsonText = lines.slice(0, -1).join("\n").trim();
  }

  return { data: JSON.parse(jsonText) as Record<string, unknown>, confidence };
}

function mapResultType(
  parsed: Record<string, unknown>,
  confidence: number,
  documentType: DocumentType,
): ExtractionResult {
  const trustTypes: DocumentType[] = [
    DocumentType.TRUST_DOCUMENT,
    DocumentType.TRUST_AMENDMENT,
  ];
  const idTypes: DocumentType[] = [DocumentType.GOVERNMENT_ID, DocumentType.PASSPORT];

  if (trustTypes.includes(documentType)) {
    return { type: "trust", data: parsed as unknown as TrustExtractionResult, confidence };
  }
  if (idTypes.includes(documentType)) {
    return {
      type: "government_id",
      data: parsed as unknown as GovernmentIdExtractionResult,
      confidence,
    };
  }
  return { type: "entity", data: parsed as unknown as EntityExtractionResult, confidence };
}

export async function extractFromDocument(
  documentText: string,
  documentType: DocumentType,
): Promise<ExtractionResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is required for document extraction");
  }

  const anthropic = new Anthropic({ apiKey });
  const userPrompt = getExtractionPrompt(documentType, documentText);
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: CLAUDE_MAX_TOKENS,
    system: EXTRACTION_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const block = response.content.find(
    (c: Anthropic.Messages.ContentBlock) => c.type === "text",
  );
  if (!block || block.type !== "text") {
    throw new Error("No text response from Claude");
  }

  try {
    const parsed = parseExtractionResponse(block.text, 0.7);
    return mapResultType(parsed.data, parsed.confidence, documentType);
  } catch {
    return {
      type: "other",
      data: { raw_text: block.text.slice(0, 5000) },
      confidence: 0.1,
    };
  }
}

export async function extractFromImage(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif",
  documentType: DocumentType,
): Promise<ExtractionResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is required for document extraction");
  }

  const anthropic = new Anthropic({ apiKey });
  const extractionInstructions = getExtractionPrompt(documentType, "[See attached image]");
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: CLAUDE_MAX_TOKENS,
    system: EXTRACTION_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: imageBase64,
            },
          },
          { type: "text", text: extractionInstructions },
        ],
      },
    ],
  });

  const block = response.content.find(
    (c: Anthropic.Messages.ContentBlock) => c.type === "text",
  );
  if (!block || block.type !== "text") {
    throw new Error("No text response from Claude");
  }

  try {
    const parsed = parseExtractionResponse(block.text, 0.6);
    return mapResultType(parsed.data, parsed.confidence, documentType);
  } catch {
    return {
      type: "other",
      data: { raw_text: block.text.slice(0, 5000) },
      confidence: 0.1,
    };
  }
}
