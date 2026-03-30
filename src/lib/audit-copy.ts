export function formatAuditDescription(
  action: string,
  details: unknown,
): string {
  const d =
    details && typeof details === "object" && !Array.isArray(details)
      ? (details as Record<string, unknown>)
      : {};

  switch (action) {
    case "ORG_SETTINGS_VIEW":
      return `Viewed organization settings (${String(d.section ?? "general")})`;
    case "TRANSACTION_CREATED":
      return `Created transaction ${String(d.file_number ?? "")}`.trim();
    case "DATA_COLLECTION_UPDATED":
      return `Updated data collection (${Math.round(Number(d.progress ?? 0) * 100)}% complete)`;
    case "FILING_VALIDATION_STARTED":
      return "Started filing validation";
    case "BENEFICIAL_OWNER_VERIFIED":
      return `Verified beneficial owner${Number(d.count ?? 1) > 1 ? "s" : ""}`;
    case "TRANSACTION_FILED_EXTERNALLY":
      return `Filed externally (${String(d.reference ?? "reference pending")})`;
    case "SCREENING_COMPLETED":
      return `Screening completed (${String(d.result ?? "result")})`;
    case "USER_ROLE_REVIEW":
      return `User roles reviewed (${String(d.reviewed ?? "review")})`;
    case "FILING_DRAFT_SAVED":
      return `Saved ${String(d.filing_type ?? "filing")} draft`;
    case "DOCUMENT_UPLOADED":
      return `Uploaded ${String(d.document_type ?? "document").replace(/_/g, " ")}`;
    default:
      return action
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase());
  }
}
