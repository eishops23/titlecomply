"use client";

import * as React from "react";
import { FileImage, FileText, FileType2, Trash2, Upload } from "lucide-react";
import { ExtractionStatus } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { DOCUMENT_TYPE_LABELS } from "./DocumentUpload";

type DocumentRow = {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  document_type: string;
  extraction_status: ExtractionStatus;
  created_at: string;
};

type Props = {
  documents: DocumentRow[];
  onExtracted: () => void;
  onDeleted: (id: string) => void;
  onReview: (id: string) => void;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatRelative(value: string): string {
  const then = new Date(value).getTime();
  const diffMs = Date.now() - then;
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function StatusBadge({ status }: { status: ExtractionStatus }) {
  const base = "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium";
  if (status === ExtractionStatus.PENDING) {
    return <span className={`${base} bg-slate-100 text-slate-700`}>Pending</span>;
  }
  if (status === ExtractionStatus.PROCESSING) {
    return (
      <span className={`${base} bg-blue-100 text-blue-800`}>
        <Spinner size="sm" className="mr-1" />
        Processing
      </span>
    );
  }
  if (status === ExtractionStatus.COMPLETED) {
    return <span className={`${base} bg-emerald-100 text-emerald-800`}>Completed</span>;
  }
  if (status === ExtractionStatus.FAILED) {
    return <span className={`${base} bg-red-100 text-red-800`}>Failed</span>;
  }
  return <span className={`${base} bg-slate-200 text-slate-700`}>Skipped</span>;
}

function FileTypeIcon({ fileType }: { fileType: string }) {
  if (fileType === "pdf") return <FileText className="h-4 w-4 text-red-600" />;
  if (["jpg", "jpeg", "png"].includes(fileType)) {
    return <FileImage className="h-4 w-4 text-blue-600" />;
  }
  return <FileType2 className="h-4 w-4 text-sky-700" />;
}

export function DocumentList({
  documents,
  onExtracted,
  onDeleted,
  onReview,
}: Props) {
  const [activeRowId, setActiveRowId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!documents.some((doc) => doc.extraction_status === ExtractionStatus.PROCESSING)) {
      return;
    }
    const timer = window.setInterval(() => onExtracted(), 3000);
    return () => window.clearInterval(timer);
  }, [documents, onExtracted]);

  async function triggerExtract(id: string) {
    setActiveRowId(id);
    try {
      await fetch(`/api/documents/${id}/extract`, { method: "POST" });
      onExtracted();
    } finally {
      setActiveRowId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    const id = deleteId;
    setActiveRowId(id);
    try {
      await fetch(`/api/documents/${id}`, { method: "DELETE" });
      onDeleted(id);
      setDeleteId(null);
    } finally {
      setActiveRowId(null);
    }
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold">Uploaded documents</h2>
      </div>
      {documents.length === 0 ? (
        <div className="p-4">
          <EmptyState
            icon={<Upload aria-hidden />}
            title="No documents uploaded"
            description="Upload your first document using the area above."
          />
        </div>
      ) : (
      <div className="overflow-x-auto sm:mx-0 -mx-4">
        <div className="min-w-[640px] sm:min-w-0">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-2">File</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Size</th>
              <th className="px-4 py-2">Uploaded</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileTypeIcon fileType={doc.file_type} />
                      <span className="truncate">{doc.file_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {DOCUMENT_TYPE_LABELS[doc.document_type] ?? doc.document_type}
                  </td>
                  <td className="px-4 py-3">{formatSize(doc.file_size)}</td>
                  <td className="px-4 py-3">{formatRelative(doc.created_at)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={doc.extraction_status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {(doc.extraction_status === ExtractionStatus.PENDING ||
                        doc.extraction_status === ExtractionStatus.FAILED) && (
                        <Button
                          size="sm"
                          loading={activeRowId === doc.id}
                          onClick={() => void triggerExtract(doc.id)}
                        >
                          Extract
                        </Button>
                      )}
                      {doc.extraction_status === ExtractionStatus.COMPLETED && (
                        <Button size="sm" variant="secondary" onClick={() => onReview(doc.id)}>
                          Review
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="Delete document"
                        onClick={() => setDeleteId(doc.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        </div>
      </div>
      )}
      <ConfirmModal
        open={deleteId != null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => void confirmDelete()}
        title="Delete document?"
        message="This permanently removes the file from this transaction."
        confirmLabel="Delete"
        variant="danger"
        isLoading={activeRowId != null && deleteId === activeRowId}
      />
    </section>
  );
}
