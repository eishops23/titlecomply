import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const ALGO = "aes-256-gcm";
const PREFIX = "enc:v1";

function resolveKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY ?? process.env.DATABASE_URL ?? "dev-only-key";
  return createHash("sha256").update(raw).digest();
}

export function encrypt(plaintext: string): string {
  if (!plaintext) return "";
  const key = resolveKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}:${iv.toString("base64url")}:${encrypted.toString("base64url")}:${tag.toString("base64url")}`;
}

export function decrypt(ciphertext: string): string {
  if (!ciphertext) return "";
  if (!ciphertext.startsWith(`${PREFIX}:`)) {
    return ciphertext;
  }

  const [prefix, version, ivPart, contentPart, tagPart] = ciphertext.split(":");
  if (prefix !== "enc" || version !== "v1" || !ivPart || !contentPart || !tagPart) {
    throw new Error("Invalid encrypted payload format");
  }

  const key = resolveKey();
  const iv = Buffer.from(ivPart, "base64url");
  const content = Buffer.from(contentPart, "base64url");
  const tag = Buffer.from(tagPart, "base64url");

  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(content), decipher.final()]);
  return plain.toString("utf8");
}
