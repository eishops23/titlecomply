import type { BadgeProps } from "@/components/ui/badge";
import { BuyerType, TransactionStatus } from "@/generated/prisma/enums";

export const STATUS_LABEL: Record<TransactionStatus, string> = {
  [TransactionStatus.SCREENING]: "Screening",
  [TransactionStatus.REQUIRES_FILING]: "Requires filing",
  [TransactionStatus.NO_FILING_REQUIRED]: "No filing required",
  [TransactionStatus.COLLECTING]: "Collecting",
  [TransactionStatus.VALIDATING]: "Validating",
  [TransactionStatus.READY_TO_FILE]: "Ready to file",
  [TransactionStatus.FILED]: "Filed",
  [TransactionStatus.ACCEPTED]: "Accepted",
  [TransactionStatus.REJECTED]: "Rejected",
  [TransactionStatus.ARCHIVED]: "Archived",
};

export const BUYER_TYPE_LABEL: Record<BuyerType, string> = {
  [BuyerType.INDIVIDUAL]: "Individual",
  [BuyerType.LLC]: "LLC",
  [BuyerType.CORPORATION]: "Corporation",
  [BuyerType.PARTNERSHIP]: "Partnership",
  [BuyerType.TRUST]: "Trust",
  [BuyerType.OTHER_ENTITY]: "Other entity",
};

export function statusToBadgeVariant(
  status: TransactionStatus,
): NonNullable<BadgeProps["variant"]> {
  switch (status) {
    case TransactionStatus.SCREENING:
    case TransactionStatus.REQUIRES_FILING:
    case TransactionStatus.NO_FILING_REQUIRED:
      return "screening";
    case TransactionStatus.COLLECTING:
      return "collecting";
    case TransactionStatus.VALIDATING:
    case TransactionStatus.READY_TO_FILE:
      return "validating";
    case TransactionStatus.FILED:
    case TransactionStatus.ACCEPTED:
      return "filed";
    case TransactionStatus.REJECTED:
      return "rejected";
    case TransactionStatus.ARCHIVED:
      return "archived";
    default:
      return "screening";
  }
}

export const ALL_TRANSACTION_STATUSES = Object.values(
  TransactionStatus,
) as TransactionStatus[];

export const ALL_BUYER_TYPES = Object.values(BuyerType) as BuyerType[];
