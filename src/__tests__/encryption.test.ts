import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  encrypt,
  decrypt,
  isEncrypted,
  maskValue,
  generateMasterKey,
} from "@/lib/encryption";

describe("Encryption", () => {
  const prevKey = process.env.ENCRYPTION_MASTER_KEY;

  beforeAll(() => {
    process.env.ENCRYPTION_MASTER_KEY = "a".repeat(64);
  });

  afterAll(() => {
    if (prevKey === undefined) {
      delete process.env.ENCRYPTION_MASTER_KEY;
    } else {
      process.env.ENCRYPTION_MASTER_KEY = prevKey;
    }
  });

  it("should encrypt and decrypt a string roundtrip", () => {
    const plaintext = "123-45-6789";
    const encrypted = encrypt(plaintext);
    expect(encrypted).not.toBe(plaintext);
    expect(encrypted.startsWith("enc:v1:")).toBe(true);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("should produce different ciphertexts for same plaintext (random IV)", () => {
    const plaintext = "test-value";
    const enc1 = encrypt(plaintext);
    const enc2 = encrypt(plaintext);
    expect(enc1).not.toBe(enc2);
    expect(decrypt(enc1)).toBe(plaintext);
    expect(decrypt(enc2)).toBe(plaintext);
  });

  it("should not double-encrypt already encrypted values", () => {
    const plaintext = "sensitive-data";
    const encrypted = encrypt(plaintext);
    const doubleEncrypted = encrypt(encrypted);
    expect(doubleEncrypted).toBe(encrypted);
  });

  it("should detect encrypted values with isEncrypted", () => {
    expect(isEncrypted("enc:v1:abc:def:ghi")).toBe(true);
    expect(isEncrypted("plain text")).toBe(false);
    expect(isEncrypted("")).toBe(false);
  });

  it("should return plaintext unmodified from decrypt if not encrypted", () => {
    const plain = "not-encrypted";
    expect(decrypt(plain)).toBe(plain);
  });

  it("should mask encrypted values showing last 4 chars", () => {
    const encrypted = encrypt("123-45-6789");
    const masked = maskValue(encrypted);
    expect(masked.endsWith("6789")).toBe(true);
    expect(masked).not.toContain("123");
  });

  it("should generate a valid 64-char hex master key", () => {
    const key = generateMasterKey();
    expect(key).toHaveLength(64);
    expect(/^[a-f0-9]{64}$/.test(key)).toBe(true);
  });
});
