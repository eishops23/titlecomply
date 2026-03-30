import * as crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const ENCODING = "base64";
const FORMAT_VERSION = "v1";
const FORMAT_PREFIX = "enc";

function getEncryptionKey(): Buffer {
  const masterKey = process.env.ENCRYPTION_MASTER_KEY;
  if (masterKey) {
    if (masterKey.length === 64) {
      return Buffer.from(masterKey, "hex");
    }
    return crypto.createHash("sha256").update(masterKey).digest();
  }

  const fallback =
    process.env.CLERK_SECRET_KEY || "titlecomply-default-key-change-me";
  return crypto.createHash("sha256").update(fallback).digest();
}

export function encrypt(plaintext: string): string {
  if (!plaintext) return plaintext;

  if (plaintext.startsWith(`${FORMAT_PREFIX}:${FORMAT_VERSION}:`)) {
    return plaintext;
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let ciphertext = cipher.update(plaintext, "utf8", ENCODING);
  ciphertext += cipher.final(ENCODING);
  const tag = cipher.getAuthTag();

  return `${FORMAT_PREFIX}:${FORMAT_VERSION}:${iv.toString(ENCODING)}:${ciphertext}:${tag.toString(ENCODING)}`;
}

export function decrypt(encrypted: string): string {
  if (!encrypted) return encrypted;

  if (!encrypted.startsWith(`${FORMAT_PREFIX}:${FORMAT_VERSION}:`)) {
    return encrypted;
  }

  const parts = encrypted.split(":");
  if (parts.length !== 5) {
    throw new Error("Invalid encrypted format: expected enc:v1:iv:ciphertext:tag");
  }

  const [, , ivB64, ciphertextB64, tagB64] = parts;

  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(ivB64, ENCODING);
    const tag = Buffer.from(tagB64, ENCODING);

    if (tag.length !== TAG_LENGTH) {
      throw new Error("Invalid auth tag length");
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let plaintext = decipher.update(ciphertextB64, ENCODING, "utf8");
    plaintext += decipher.final("utf8");
    return plaintext;
  } catch (error) {
    throw new Error(
      `Decryption failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export function isEncrypted(value: string): boolean {
  return value.startsWith(`${FORMAT_PREFIX}:${FORMAT_VERSION}:`);
}

export function maskValue(value: string | null, showLast: number = 4): string {
  if (!value) return "—";
  try {
    const plain = isEncrypted(value) ? decrypt(value) : value;
    if (plain.length <= showLast) return "***";
    return "•".repeat(plain.length - showLast) + plain.slice(-showLast);
  } catch {
    return "***";
  }
}

export function generateMasterKey(): string {
  return crypto.randomBytes(32).toString("hex");
}
