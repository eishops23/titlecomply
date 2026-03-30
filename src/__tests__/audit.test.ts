import { describe, it, expect } from "vitest";
import crypto from "crypto";

function computeHash(
  previousHash: string | null,
  action: string,
  details: Record<string, unknown> | null,
  timestamp: string,
): string {
  const payload = `${previousHash || ""}${action}${JSON.stringify(details || {})}${timestamp}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}

describe("Audit Trail Hash Chain", () => {
  it("should compute a deterministic hash for same inputs", () => {
    const hash1 = computeHash(
      null,
      "transaction.created",
      { id: "123" },
      "2026-03-15T10:00:00Z",
    );
    const hash2 = computeHash(
      null,
      "transaction.created",
      { id: "123" },
      "2026-03-15T10:00:00Z",
    );
    expect(hash1).toBe(hash2);
  });

  it("should produce different hashes for different actions", () => {
    const hash1 = computeHash(null, "transaction.created", {}, "2026-03-15T10:00:00Z");
    const hash2 = computeHash(null, "transaction.updated", {}, "2026-03-15T10:00:00Z");
    expect(hash1).not.toBe(hash2);
  });

  it("should chain hashes correctly", () => {
    const hash1 = computeHash(
      null,
      "transaction.created",
      { id: "1" },
      "2026-03-15T10:00:00Z",
    );
    const hash2 = computeHash(
      hash1,
      "document.uploaded",
      { id: "2" },
      "2026-03-15T10:01:00Z",
    );
    const hash3 = computeHash(
      hash2,
      "filing.generated",
      { id: "3" },
      "2026-03-15T10:02:00Z",
    );

    expect(hash2).not.toBe(hash1);
    expect(hash3).not.toBe(hash2);

    const hash2Recomputed = computeHash(
      hash1,
      "document.uploaded",
      { id: "2" },
      "2026-03-15T10:01:00Z",
    );
    expect(hash2Recomputed).toBe(hash2);
  });

  it("should detect tampering when a previous hash is modified", () => {
    const hash1 = computeHash(null, "transaction.created", {}, "2026-03-15T10:00:00Z");
    const hash2 = computeHash(hash1, "filing.generated", {}, "2026-03-15T10:01:00Z");

    const tamperedHash2 = computeHash("fake-hash", "filing.generated", {}, "2026-03-15T10:01:00Z");
    expect(tamperedHash2).not.toBe(hash2);
  });

  it("should produce 64-char hex hashes", () => {
    const hash = computeHash(null, "test", {}, "2026-01-01T00:00:00Z");
    expect(hash).toHaveLength(64);
    expect(/^[a-f0-9]{64}$/.test(hash)).toBe(true);
  });
});
