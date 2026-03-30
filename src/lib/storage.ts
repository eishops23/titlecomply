import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["pdf", "jpg", "jpeg", "png", "docx"]);

export interface StoredFile {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  storagePath: string;
}

async function ensureUploadDir(subDir: string): Promise<string> {
  const dir = path.join(UPLOAD_DIR, subDir);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function storeFile(
  file: Buffer,
  originalName: string,
  transactionId: string,
): Promise<StoredFile> {
  if (file.length > MAX_FILE_SIZE) {
    throw new Error(`File exceeds maximum size of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  const ext = path.extname(originalName).toLowerCase().replace(".", "");
  if (!ALLOWED_TYPES.has(ext)) {
    throw new Error(`File type .${ext} is not allowed. Accepted: ${Array.from(ALLOWED_TYPES).join(", ")}`);
  }

  const dir = await ensureUploadDir(transactionId);
  const uniqueName = `${crypto.randomUUID()}.${ext}`;
  const filePath = path.join(dir, uniqueName);
  await fs.writeFile(filePath, file);

  return {
    fileUrl: `/uploads/${transactionId}/${uniqueName}`,
    fileName: originalName,
    fileSize: file.length,
    fileType: ext === "jpeg" ? "jpg" : ext,
    storagePath: filePath,
  };
}

export async function readFile(storagePath: string): Promise<Buffer> {
  return fs.readFile(storagePath);
}

export async function deleteFile(storagePath: string): Promise<void> {
  try {
    await fs.unlink(storagePath);
  } catch {
    // File may already be deleted.
  }
}

export async function extractTextFromPdf(fileBuffer: Buffer): Promise<string> {
  const pdfParseModule = await import("pdf-parse");
  const parser = pdfParseModule as unknown as {
    default?: (buffer: Buffer) => Promise<{ text: string }>;
    (buffer: Buffer): Promise<{ text: string }>;
  };
  const parseFn = parser.default ?? parser;
  const result = await parseFn(fileBuffer);
  return result.text;
}
