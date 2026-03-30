"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import type {
  BeneficialOwner,
  Document,
  EntityDetail,
  TrustDetail,
  Transaction,
} from "@/generated/prisma/client";
import type { ExtractionResult } from "@/lib/claude";
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import { DocumentList } from "@/components/documents/DocumentList";
import { ExtractionReview } from "@/components/documents/ExtractionReview";
import { Alert } from "@/components/ui/alert";
import { planHasFeature } from "@/lib/plan-gates";

export const dynamic = "force-dynamic";

type TransactionPayload = Transaction & {
  documents: Document[];
  organization: {
    plan: string;
  };
  entity_detail: EntityDetail | null;
  trust_detail: TrustDetail | null;
  beneficial_owners: BeneficialOwner[];
};

type DocumentDetailPayload = Document & {
  extraction_result: ExtractionResult;
  transaction: {
    entity_detail: EntityDetail | null;
    trust_detail: TrustDetail | null;
    beneficial_owners: BeneficialOwner[];
  };
};

export default function TransactionDocumentsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const transactionId = params.id;

  const [transaction, setTransaction] = React.useState<TransactionPayload | null>(null);
  const [selectedDocument, setSelectedDocument] =
    React.useState<DocumentDetailPayload | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const fetchTransaction = React.useCallback(async () => {
    const response = await fetch(`/api/transactions/${transactionId}`, {
      method: "GET",
      cache: "no-store",
    });
    const data = (await response.json()) as {
      transaction?: TransactionPayload;
      error?: string;
    };
    if (!response.ok || !data.transaction) {
      throw new Error(data.error || "Failed to load transaction");
    }
    setTransaction(data.transaction);
  }, [transactionId]);

  React.useEffect(() => {
    void fetchTransaction().catch((loadError) => {
      const message = loadError instanceof Error ? loadError.message : "Failed to load";
      setError(message);
    });
  }, [fetchTransaction]);

  async function openReview(documentId: string) {
    const response = await fetch(`/api/documents/${documentId}`, {
      method: "GET",
      cache: "no-store",
    });
    const data = (await response.json()) as {
      document?: DocumentDetailPayload;
      error?: string;
    };
    if (!response.ok || !data.document) {
      setError(data.error || "Failed to load extraction details");
      return;
    }
    setSelectedDocument(data.document);
  }

  if (!transaction) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-600">Loading documents...</p>
        {error ? (
          <Alert className="mt-3" variant="error">
            {error}
          </Alert>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-xl font-semibold">Document Management & AI Extraction</h1>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <DocumentUpload
        transactionId={transactionId}
        onUploaded={() => {
          void fetchTransaction();
          router.refresh();
        }}
      />

      <DocumentList
        documents={transaction.documents.map((doc) => ({
          ...doc,
          created_at: doc.created_at.toISOString(),
        }))}
        onExtracted={() => {
          void fetchTransaction();
          router.refresh();
        }}
        onDeleted={() => {
          void fetchTransaction();
          router.refresh();
        }}
        onReview={(id) => void openReview(id)}
        canExtract={planHasFeature(transaction.organization.plan, "aiDocExtraction")}
        currentPlan={transaction.organization.plan}
      />

      {selectedDocument ? (
        <ExtractionReview
          document={{
            id: selectedDocument.id,
            document_type: selectedDocument.document_type,
            extraction_result: selectedDocument.extraction_result,
            extraction_confidence: selectedDocument.extraction_confidence,
          }}
          currentData={{
            entityDetail: selectedDocument.transaction.entity_detail,
            trustDetail: selectedDocument.transaction.trust_detail,
            beneficialOwners: selectedDocument.transaction.beneficial_owners,
          }}
          onApply={() => {
            setSelectedDocument(null);
            void fetchTransaction();
            router.refresh();
          }}
          onClose={() => setSelectedDocument(null)}
        />
      ) : null}
    </div>
  );
}
