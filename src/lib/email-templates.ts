// ─── Brand Constants ───────────────────────────────────────────────────

const BRAND = {
  primary: "#1E3A5F",
  accent: "#2563EB",
  success: "#059669",
  warning: "#D97706",
  danger: "#DC2626",
  background: "#F8FAFC",
  white: "#FFFFFF",
  text: "#0F172A",
  muted: "#64748B",
};

// ─── Base Layout ───────────────────────────────────────────────────────

function baseLayout(content: string, appUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:${BRAND.background};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.background};">
    <tr><td align="center" style="padding:40px 20px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:${BRAND.white};border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr><td style="background-color:${BRAND.primary};padding:24px 32px;">
          <span style="color:${BRAND.white};font-size:20px;font-weight:700;letter-spacing:-0.5px;">TitleComply</span>
        </td></tr>
        <!-- Content -->
        <tr><td style="padding:32px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 32px;border-top:1px solid #E2E8F0;">
          <p style="margin:0;font-size:12px;color:${BRAND.muted};line-height:1.5;">
            TitleComply — FinCEN Compliance Automation for Title & Escrow<br>
            <a href="${appUrl}" style="color:${BRAND.accent};text-decoration:none;">titlecomply.com</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Button Helper ─────────────────────────────────────────────────────

function button(text: string, url: string, color: string = BRAND.accent): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td style="background-color:${color};border-radius:6px;padding:12px 24px;">
      <a href="${url}" style="color:${BRAND.white};font-size:14px;font-weight:600;text-decoration:none;display:inline-block;">${text}</a>
    </td></tr>
  </table>`;
}

// ─── Templates ─────────────────────────────────────────────────────────

interface TemplateData extends Record<string, unknown> {
  appUrl?: string;
  recipientName?: string;
}

const templates: Record<string, (data: TemplateData) => string> = {
  welcome: (data) => {
    const name = data.recipientName || "there";
    const appUrl = data.appUrl || "https://titlecomply.com";
    return baseLayout(
      `
      <h1 style="margin:0 0 16px;font-size:22px;color:${BRAND.text};">Welcome to TitleComply</h1>
      <p style="margin:0 0 16px;font-size:15px;color:${BRAND.text};line-height:1.6;">
        Hi ${name}, your account is ready. TitleComply automates FinCEN Real Estate Report compliance so you can focus on closing deals, not paperwork.
      </p>
      <p style="margin:0 0 8px;font-size:15px;color:${BRAND.text};line-height:1.6;">Here's how to get started:</p>
      <ol style="margin:0 0 16px;padding-left:20px;font-size:14px;color:${BRAND.text};line-height:1.8;">
        <li>Complete your organization settings</li>
        <li>Create your first transaction</li>
        <li>Run the FinCEN screening</li>
        <li>Collect data and generate your filing</li>
      </ol>
      ${button("Go to Dashboard", `${appUrl}/dashboard`)}
      <p style="margin:0;font-size:13px;color:${BRAND.muted};">Your 14-day free trial has started. No credit card required.</p>
    `,
      appUrl,
    );
  },

  transaction_created: (data) => {
    const name = data.recipientName || "there";
    const appUrl = data.appUrl || "https://titlecomply.com";
    const address = data.propertyAddress || "New Property";
    const fileNum = data.fileNumber || "—";
    return baseLayout(
      `
      <h1 style="margin:0 0 16px;font-size:22px;color:${BRAND.text};">New Transaction Assigned</h1>
      <p style="margin:0 0 16px;font-size:15px;color:${BRAND.text};line-height:1.6;">
        Hi ${name}, a new transaction has been assigned to you.
      </p>
      <table role="presentation" width="100%" style="margin:0 0 24px;background-color:${BRAND.background};border-radius:6px;padding:16px;">
        <tr><td style="padding:8px 16px;font-size:13px;color:${BRAND.muted};">Property</td><td style="padding:8px 16px;font-size:14px;color:${BRAND.text};font-weight:600;">${address}</td></tr>
        <tr><td style="padding:8px 16px;font-size:13px;color:${BRAND.muted};">File #</td><td style="padding:8px 16px;font-size:14px;color:${BRAND.text};">${fileNum}</td></tr>
      </table>
      ${button("View Transaction", `${appUrl}/transactions/${data.transactionId || ""}`)}
    `,
      appUrl,
    );
  },

  screening_complete: (data) => {
    const name = data.recipientName || "there";
    const appUrl = data.appUrl || "https://titlecomply.com";
    const result = (data.result as string) || "UNKNOWN";
    const color =
      result === "REQUIRED"
        ? BRAND.danger
        : result === "NOT_REQUIRED"
          ? BRAND.success
          : BRAND.warning;
    const label =
      result === "REQUIRED"
        ? "Filing Required"
        : result === "NOT_REQUIRED"
          ? "No Filing Required"
          : "Needs Review";
    return baseLayout(
      `
      <h1 style="margin:0 0 16px;font-size:22px;color:${BRAND.text};">Screening Complete</h1>
      <p style="margin:0 0 16px;font-size:15px;color:${BRAND.text};line-height:1.6;">
        Hi ${name}, the FinCEN screening for <strong>${data.propertyAddress || "your transaction"}</strong> is complete.
      </p>
      <div style="margin:0 0 24px;padding:16px;background-color:${BRAND.background};border-left:4px solid ${color};border-radius:4px;">
        <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:${color};">${label}</p>
        <p style="margin:0;font-size:14px;color:${BRAND.text};">${data.reason || ""}</p>
      </div>
      ${result === "REQUIRED" ? button("Start Data Collection", `${appUrl}/transactions/${data.transactionId || ""}/collect`) : button("View Transaction", `${appUrl}/transactions/${data.transactionId || ""}`)}
    `,
      appUrl,
    );
  },

  missing_data_reminder: (data) => {
    const name = data.recipientName || "there";
    const appUrl = data.appUrl || "https://titlecomply.com";
    const fields = Array.isArray(data.missingFields)
      ? (data.missingFields as string[]).join(", ")
      : "various fields";
    return baseLayout(
      `
      <h1 style="margin:0 0 16px;font-size:22px;color:${BRAND.text};">Data Collection Reminder</h1>
      <p style="margin:0 0 16px;font-size:15px;color:${BRAND.text};line-height:1.6;">
        Hi ${name}, the transaction for <strong>${data.propertyAddress || "a property"}</strong> has been pending data collection for <strong>${data.daysPending || "?"} days</strong>.
      </p>
      <p style="margin:0 0 8px;font-size:14px;color:${BRAND.text};">Missing information:</p>
      <p style="margin:0 0 24px;font-size:14px;color:${BRAND.danger};">${fields}</p>
      ${button("Complete Data Collection", `${appUrl}/transactions/${data.transactionId || ""}/collect`, BRAND.warning)}
    `,
      appUrl,
    );
  },

  filing_generated: (data) => {
    const name = data.recipientName || "there";
    const appUrl = data.appUrl || "https://titlecomply.com";
    return baseLayout(
      `
      <h1 style="margin:0 0 16px;font-size:22px;color:${BRAND.text};">Filing Generated</h1>
      <p style="margin:0 0 16px;font-size:15px;color:${BRAND.text};line-height:1.6;">
        Hi ${name}, a FinCEN Real Estate Report has been generated for <strong>${data.propertyAddress || "your transaction"}</strong>.
      </p>
      <table role="presentation" width="100%" style="margin:0 0 24px;background-color:${BRAND.background};border-radius:6px;">
        <tr><td style="padding:8px 16px;font-size:13px;color:${BRAND.muted};">Filing ID</td><td style="padding:8px 16px;font-size:14px;color:${BRAND.text};font-weight:600;">${data.filingId || "—"}</td></tr>
        <tr><td style="padding:8px 16px;font-size:13px;color:${BRAND.muted};">Property</td><td style="padding:8px 16px;font-size:14px;color:${BRAND.text};">${data.propertyAddress || "—"}</td></tr>
      </table>
      ${button("View Filing & Download PDF", `${appUrl}/transactions/${data.transactionId || ""}/filing`, BRAND.success)}
      <p style="margin:16px 0 0;font-size:13px;color:${BRAND.muted};">Remember to submit the filing through FinCEN's BSA E-Filing System.</p>
    `,
      appUrl,
    );
  },

  overdue_alert: (data) => {
    const name = data.recipientName || "there";
    const appUrl = data.appUrl || "https://titlecomply.com";
    return baseLayout(
      `
      <h1 style="margin:0 0 16px;font-size:22px;color:${BRAND.danger};">Overdue Filing Alert</h1>
      <p style="margin:0 0 16px;font-size:15px;color:${BRAND.text};line-height:1.6;">
        Hi ${name}, the transaction for <strong>${data.propertyAddress || "a property"}</strong> is <strong>${data.daysOverdue || "?"} days overdue</strong> for FinCEN filing.
      </p>
      <div style="margin:0 0 24px;padding:16px;background-color:#FEF2F2;border-left:4px solid ${BRAND.danger};border-radius:4px;">
        <p style="margin:0;font-size:14px;color:${BRAND.danger};font-weight:600;">FinCEN requires filing within 30 days of closing. Non-compliance may result in federal penalties.</p>
      </div>
      ${button("Take Action Now", `${appUrl}/transactions/${data.transactionId || ""}/filing`, BRAND.danger)}
    `,
      appUrl,
    );
  },

  team_invitation: (data) => {
    const appUrl = data.appUrl || "https://titlecomply.com";
    const roleName = data.role || "team member";
    return baseLayout(
      `
      <h1 style="margin:0 0 16px;font-size:22px;color:${BRAND.text};">You're Invited to TitleComply</h1>
      <p style="margin:0 0 16px;font-size:15px;color:${BRAND.text};line-height:1.6;">
        ${data.invitedBy || "A team member"} has invited you to join <strong>${data.orgName || "their organization"}</strong> on TitleComply as a <strong>${roleName}</strong>.
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:${BRAND.text};line-height:1.6;">
        TitleComply automates FinCEN Real Estate Report compliance for title and escrow companies.
      </p>
      ${button("Accept Invitation", `${appUrl}/sign-up`)}
      <p style="margin:16px 0 0;font-size:13px;color:${BRAND.muted};">If you did not expect this invitation, you can safely ignore this email.</p>
    `,
      appUrl,
    );
  },

  monthly_summary: (data) => {
    const name = data.recipientName || "there";
    const appUrl = data.appUrl || "https://titlecomply.com";
    const month = data.month || "Last month";
    return baseLayout(
      `
      <h1 style="margin:0 0 16px;font-size:22px;color:${BRAND.text};">Monthly Compliance Summary</h1>
      <p style="margin:0 0 16px;font-size:15px;color:${BRAND.text};line-height:1.6;">
        Hi ${name}, here's your compliance summary for <strong>${month}</strong>.
      </p>
      <table role="presentation" width="100%" style="margin:0 0 24px;background-color:${BRAND.background};border-radius:6px;">
        <tr><td style="padding:8px 16px;font-size:13px;color:${BRAND.muted};">Transactions Created</td><td style="padding:8px 16px;font-size:14px;color:${BRAND.text};font-weight:600;">${data.transactionsCreated || 0}</td></tr>
        <tr><td style="padding:8px 16px;font-size:13px;color:${BRAND.muted};">Filings Generated</td><td style="padding:8px 16px;font-size:14px;color:${BRAND.text};font-weight:600;">${data.filingsGenerated || 0}</td></tr>
        <tr><td style="padding:8px 16px;font-size:13px;color:${BRAND.muted};">Filed on Time</td><td style="padding:8px 16px;font-size:14px;color:${BRAND.success};font-weight:600;">${data.filedOnTime || 0}</td></tr>
        <tr><td style="padding:8px 16px;font-size:13px;color:${BRAND.muted};">Overdue</td><td style="padding:8px 16px;font-size:14px;color:${data.overdue ? BRAND.danger : BRAND.success};font-weight:600;">${data.overdue || 0}</td></tr>
      </table>
      ${button("View Full Report", `${appUrl}/reports`)}
    `,
      appUrl,
    );
  },
};

// ─── Exports ───────────────────────────────────────────────────────────

export function getEmailTemplate(template: string, data: TemplateData): string {
  const renderer = templates[template];
  if (!renderer) {
    return baseLayout(
      `<p>Email template "${template}" not found.</p>`,
      data.appUrl || "https://titlecomply.com",
    );
  }
  return renderer(data);
}

export function getEmailSubject(template: string, data: TemplateData): string {
  const subjects: Record<string, string> = {
    welcome: "Welcome to TitleComply",
    transaction_created: `New Transaction Assigned: ${data.propertyAddress || "Property"}`,
    screening_complete: `Screening Complete: ${data.propertyAddress || "Property"} — ${data.result || "Result"}`,
    missing_data_reminder: `Reminder: Data Needed for ${data.propertyAddress || "Transaction"}`,
    filing_generated: `Filing Generated: ${data.filingId || "FinCEN Report"} — ${data.propertyAddress || "Property"}`,
    overdue_alert: `⚠ OVERDUE: Filing Required for ${data.propertyAddress || "Transaction"}`,
    team_invitation: `You're Invited to ${data.orgName || "TitleComply"}`,
    monthly_summary: `TitleComply Monthly Compliance Summary — ${data.month || ""}`,
  };
  return subjects[template] || "TitleComply Notification";
}
