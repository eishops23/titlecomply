export interface WireInstruction {
  id: string;
  transactionId: string;
  partyRole: "buyer" | "seller" | "lender" | "settlement_agent";
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  accountName: string;
  bankAddress: string;
  swiftCode?: string;
  reference: string;
  amount: number;
  submittedBy: string;
  submittedAt: string;
  verificationStatus: "pending" | "verified" | "flagged" | "confirmed";
  flags: WireFlag[];
  confirmations: WireConfirmation[];
}

export interface WireFlag {
  type:
    | "routing_mismatch"
    | "account_change"
    | "email_domain_change"
    | "amount_mismatch"
    | "last_minute_change"
    | "international_wire"
    | "new_bank"
    | "suspicious_pattern";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  detectedAt: string;
}

export interface WireConfirmation {
  userId: string;
  userName: string;
  method: "in_app" | "phone_callback" | "in_person";
  confirmedAt: string;
  notes?: string;
}

export function verifyWireInstructions(
  current: {
    bankName: string;
    routingNumber: string;
    accountNumber: string;
    amount: number;
    submittedAt: string;
  },
  previous?: {
    bankName: string;
    routingNumber: string;
    accountNumber: string;
    amount: number;
  } | null,
  transactionClosingDate?: Date | null,
): WireFlag[] {
  const flags: WireFlag[] = [];
  const now = new Date();

  if (!isValidRoutingNumber(current.routingNumber)) {
    flags.push({
      type: "routing_mismatch",
      severity: "high",
      message: `Routing number ${current.routingNumber} fails ABA check digit validation.`,
      detectedAt: now.toISOString(),
    });
  }

  if (previous) {
    if (previous.routingNumber !== current.routingNumber) {
      flags.push({
        type: "account_change",
        severity: "critical",
        message: `ROUTING NUMBER CHANGED from ${maskNumber(previous.routingNumber)} to ${maskNumber(current.routingNumber)}.`,
        detectedAt: now.toISOString(),
      });
    }
    if (previous.accountNumber !== current.accountNumber) {
      flags.push({
        type: "account_change",
        severity: "critical",
        message: "ACCOUNT NUMBER CHANGED. Verify by phone callback to a known number.",
        detectedAt: now.toISOString(),
      });
    }
    if (previous.bankName.toLowerCase() !== current.bankName.toLowerCase()) {
      flags.push({
        type: "new_bank",
        severity: "high",
        message: `Bank changed from "${previous.bankName}" to "${current.bankName}".`,
        detectedAt: now.toISOString(),
      });
    }
    const amountDiff = Math.abs(current.amount - previous.amount);
    const pct = previous.amount > 0 ? (amountDiff / previous.amount) * 100 : 0;
    if (pct > 5) {
      flags.push({
        type: "amount_mismatch",
        severity: "medium",
        message: `Wire amount changed by ${pct.toFixed(1)}%.`,
        detectedAt: now.toISOString(),
      });
    }
  }

  if (transactionClosingDate && previous) {
    const hoursUntilClose = (transactionClosingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilClose <= 24) {
      flags.push({
        type: "last_minute_change",
        severity: "critical",
        message: "Wire instructions changed within 24 hours of closing.",
        detectedAt: now.toISOString(),
      });
    }
  }

  if (current.bankName.toLowerCase().includes("international") || current.routingNumber.length !== 9) {
    flags.push({
      type: "international_wire",
      severity: "medium",
      message: "International wire indicators detected.",
      detectedAt: now.toISOString(),
    });
  }

  return flags;
}

function isValidRoutingNumber(routing: string): boolean {
  if (!/^\d{9}$/.test(routing)) return false;
  const d = routing.split("").map(Number);
  const checksum = (3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + (d[2] + d[5] + d[8])) % 10;
  return checksum === 0;
}

function maskNumber(num: string): string {
  if (num.length <= 4) return "****";
  return "*".repeat(num.length - 4) + num.slice(-4);
}

export function getRequiredConfirmations(flags: WireFlag[]): {
  count: number;
  requirePhoneCallback: boolean;
  message: string;
} {
  const hasCritical = flags.some((f) => f.severity === "critical");
  const hasHigh = flags.some((f) => f.severity === "high");
  if (hasCritical) {
    return {
      count: 2,
      requirePhoneCallback: true,
      message: "CRITICAL: 2 confirmations required, including phone callback.",
    };
  }
  if (hasHigh) {
    return { count: 2, requirePhoneCallback: false, message: "HIGH RISK: 2 confirmations required." };
  }
  if (flags.length > 0) {
    return { count: 1, requirePhoneCallback: false, message: "Flags detected. 1 confirmation required." };
  }
  return { count: 1, requirePhoneCallback: false, message: "Standard verification. 1 confirmation required." };
}
