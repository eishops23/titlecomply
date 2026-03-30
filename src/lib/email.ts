import { getEmailSubject, getEmailTemplate } from "./email-templates";

// ─── Types ─────────────────────────────────────────────────────────────

export type EmailTemplate =
  | "welcome"
  | "transaction_created"
  | "screening_complete"
  | "missing_data_reminder"
  | "filing_generated"
  | "overdue_alert"
  | "team_invitation"
  | "monthly_summary";

export interface EmailData {
  recipientName?: string;
  [key: string]: unknown;
}

export interface SendEmailOptions {
  to: string;
  template: EmailTemplate;
  data: EmailData;
  /** Optional: override the subject line from the template */
  subjectOverride?: string;
  /** Optional: attach a file (e.g., filing PDF) */
  attachments?: Array<{
    filename: string;
    content: string; // Base64-encoded
    type: string; // MIME type
  }>;
}

// ─── Constants ─────────────────────────────────────────────────────────

const SENDGRID_API_URL = "https://api.sendgrid.com/v3/mail/send";
const FROM_EMAIL =
  process.env.EMAIL_FROM ||
  process.env.SENDGRID_FROM_EMAIL ||
  "notifications@titlecomply.com";
const FROM_NAME = process.env.EMAIL_FROM_NAME || "TitleComply";
const APP_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://titlecomply.com";

// ─── Send Email ────────────────────────────────────────────────────────

/**
 * Send an email via SendGrid.
 * Graceful fallback: if SENDGRID_API_KEY is not set, logs the email instead of crashing.
 */
export async function sendEmail(
  options: SendEmailOptions,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { to, template, data, subjectOverride, attachments } = options;

  const apiKey = process.env.SENDGRID_API_KEY;

  const subject = subjectOverride || getEmailSubject(template, data);
  const htmlContent = getEmailTemplate(template, { ...data, appUrl: APP_URL });

  if (!apiKey) {
    console.log(`[email] SendGrid not configured. Would send:`);
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Template: ${template}`);
    return { success: true, messageId: "local-" + Date.now() };
  }

  try {
    const payload: Record<string, unknown> = {
      personalizations: [{ to: [{ email: to }] }],
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject,
      content: [{ type: "text/html", value: htmlContent }],
    };

    if (attachments && attachments.length > 0) {
      payload.attachments = attachments.map((a) => ({
        filename: a.filename,
        content: a.content,
        type: a.type,
        disposition: "attachment",
      }));
    }

    const response = await fetch(SENDGRID_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[email] SendGrid error ${response.status}:`, errorBody);
      return { success: false, error: `SendGrid: ${response.status}` };
    }

    const messageId = response.headers.get("x-message-id") || undefined;
    console.log(`[email] Sent ${template} to ${to} (${messageId})`);
    return { success: true, messageId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[email] Failed to send ${template} to ${to}:`, message);
    return { success: false, error: message };
  }
}

// ─── Convenience Functions ─────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, recipientName: string): Promise<void> {
  await sendEmail({
    to,
    template: "welcome",
    data: { recipientName },
  });
}

export async function sendTransactionCreatedEmail(
  to: string,
  data: {
    recipientName: string;
    propertyAddress: string;
    fileNumber: string | null;
    transactionId: string;
  },
): Promise<void> {
  await sendEmail({
    to,
    template: "transaction_created",
    data,
  });
}

export async function sendScreeningCompleteEmail(
  to: string,
  data: {
    recipientName: string;
    propertyAddress: string;
    result: string;
    reason: string;
    transactionId: string;
  },
): Promise<void> {
  await sendEmail({
    to,
    template: "screening_complete",
    data,
  });
}

export async function sendFilingGeneratedEmail(
  to: string,
  data: {
    recipientName: string;
    propertyAddress: string;
    filingId: string;
    transactionId: string;
  },
): Promise<void> {
  await sendEmail({
    to,
    template: "filing_generated",
    data,
  });
}

export async function sendTeamInvitationEmail(
  to: string,
  data: { orgName: string; role: string; invitedBy: string },
): Promise<void> {
  await sendEmail({
    to,
    template: "team_invitation",
    data,
  });
}

export async function sendMissingDataReminderEmail(
  to: string,
  data: {
    recipientName: string;
    propertyAddress: string;
    missingFields: string[];
    transactionId: string;
    daysPending: number;
  },
): Promise<void> {
  await sendEmail({
    to,
    template: "missing_data_reminder",
    data,
  });
}

export async function sendOverdueAlertEmail(
  to: string,
  data: {
    recipientName: string;
    propertyAddress: string;
    daysOverdue: number;
    transactionId: string;
  },
): Promise<void> {
  await sendEmail({
    to,
    template: "overdue_alert",
    data,
  });
}
