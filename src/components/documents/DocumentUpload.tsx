"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Select } from "@/components/ui/select";

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  OPERATING_AGREEMENT: "Operating Agreement",
  ARTICLES_OF_INCORPORATION: "Articles of Incorporation",
  ARTICLES_OF_ORGANIZATION: "Articles of Organization",
  TRUST_DOCUMENT: "Trust Document",
  TRUST_AMENDMENT: "Trust Amendment",
  CERTIFICATE_OF_GOOD_STANDING: "Certificate of Good Standing",
  EIN_LETTER: "EIN Letter (IRS)",
  GOVERNMENT_ID: "Government ID",
  PASSPORT: "Passport",
  PURCHASE_AGREEMENT: "Purchase Agreement",
  SETTLEMENT_STATEMENT: "Settlement Statement (HUD-1/CD)",
  WIRE_INSTRUCTIONS: "Wire Instructions",
  OTHER: "Other Document",
};

type UploadDocument = {
  id: string;
  file_name: string;
};

type Props = {
  transactionId: string;
  onUploaded: (docs: UploadDocument[]) => void;
};

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["pdf", "jpg", "jpeg", "png", "docx"]);

function getExtension(name: string): string {
  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

export function DocumentUpload({ transactionId, onUploaded }: Props) {
  const [dragOver, setDragOver] = React.useState(false);
  const [documentType, setDocumentType] = React.useState("OPERATING_AGREEMENT");
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [progressByFile, setProgressByFile] = React.useState<Record<string, number>>({});
  const inputRef = React.useRef<HTMLInputElement>(null);

  const options = React.useMemo(
    () =>
      Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => ({ value, label })),
    [],
  );

  const validateFile = React.useCallback((file: File): string | null => {
    const ext = getExtension(file.name);
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return "Allowed file types: pdf, jpg, png, docx.";
    }
    if (file.size > MAX_SIZE_BYTES) {
      return "File exceeds 10MB limit.";
    }
    return null;
  }, []);

  const uploadFiles = React.useCallback(
    async (files: FileList | File[]) => {
      const queue = Array.from(files);
      if (!queue.length) return;
      setError(null);
      setUploading(true);
      const uploaded: UploadDocument[] = [];

      for (let i = 0; i < queue.length; i += 1) {
        const file = queue[i];
        const validationError = validateFile(file);
        if (validationError) {
          setError(`${file.name}: ${validationError}`);
          continue;
        }

        setProgressByFile((prev) => ({ ...prev, [file.name]: 15 }));
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("transactionId", transactionId);
          formData.append("documentType", documentType);

          const response = await fetch("/api/documents/upload", {
            method: "POST",
            body: formData,
          });
          setProgressByFile((prev) => ({ ...prev, [file.name]: 85 }));

          const data = (await response.json()) as {
            document?: UploadDocument;
            error?: string;
          };
          if (!response.ok || !data.document) {
            throw new Error(data.error || "Upload failed");
          }
          uploaded.push(data.document);
          setProgressByFile((prev) => ({ ...prev, [file.name]: 100 }));
        } catch (uploadError) {
          const message =
            uploadError instanceof Error ? uploadError.message : "Upload failed";
          setError(`${file.name}: ${message}`);
          setProgressByFile((prev) => ({ ...prev, [file.name]: 0 }));
        }
      }

      if (uploaded.length > 0) {
        onUploaded(uploaded);
      }
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setTimeout(() => setProgressByFile({}), 1000);
    },
    [documentType, onUploaded, transactionId, validateFile],
  );

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <div className="mb-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <Select
          label="Document type"
          value={documentType}
          onChange={(event) => setDocumentType(event.target.value)}
          options={options}
        />
        <Button
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          Select files
        </Button>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          void uploadFiles(event.dataTransfer.files);
        }}
        className={`rounded-md border-2 border-dashed p-8 text-center transition-colors ${
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 bg-slate-50"
        }`}
      >
        <Upload className="mx-auto mb-2 h-8 w-8 text-slate-500" />
        <p className="text-sm font-medium text-slate-900">
          Drag and drop documents here
        </p>
        <p className="mt-1 text-xs text-slate-600">
          PDF, JPG, PNG, DOCX up to 10MB
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.docx"
        onChange={(event) => {
          if (event.target.files) {
            void uploadFiles(event.target.files);
          }
        }}
      />

      {Object.keys(progressByFile).length > 0 ? (
        <div className="mt-3 space-y-2">
          {Object.entries(progressByFile).map(([fileName, progress]) => (
            <div key={fileName}>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-700">
                <span className="truncate">{fileName}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 rounded bg-slate-200">
                <div
                  className="h-2 rounded bg-blue-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {error ? (
        <Alert className="mt-3" variant="error">
          {error}
        </Alert>
      ) : null}
    </section>
  );
}
