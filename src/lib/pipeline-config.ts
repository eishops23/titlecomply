import { TransactionStatus } from "@/generated/prisma/enums";

export const PIPELINE_KEYS = [
  "screening",
  "collecting",
  "validating",
  "ready_to_file",
  "filed",
] as const;

export type PipelineKey = (typeof PIPELINE_KEYS)[number];

export function parsePipelineParam(
  value: string | undefined,
): PipelineKey | null {
  if (!value) return null;
  return (PIPELINE_KEYS as readonly string[]).includes(value)
    ? (value as PipelineKey)
    : null;
}

export const PIPELINE_CONFIG: Record<
  PipelineKey,
  { label: string; statuses: TransactionStatus[] }
> = {
  screening: {
    label: "Screening",
    statuses: [
      TransactionStatus.SCREENING,
      TransactionStatus.REQUIRES_FILING,
      TransactionStatus.NO_FILING_REQUIRED,
    ],
  },
  collecting: {
    label: "Collecting",
    statuses: [TransactionStatus.COLLECTING],
  },
  validating: {
    label: "Validating",
    statuses: [TransactionStatus.VALIDATING],
  },
  ready_to_file: {
    label: "Ready to File",
    statuses: [TransactionStatus.READY_TO_FILE],
  },
  filed: {
    label: "Filed",
    statuses: [TransactionStatus.FILED, TransactionStatus.ACCEPTED],
  },
};
