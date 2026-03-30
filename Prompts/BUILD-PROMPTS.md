# TitleComply — Cursor Build Prompts
## MVP in 20 Prompts (4 weeks)

Reference @file SPEC.md for every prompt below.

---

## PROMPT 01 — Project Scaffolding

Create a new Next.js 15 project with TypeScript and App Router for TitleComply, a B2B SaaS platform for FinCEN compliance automation for title and escrow companies.

Setup:
1. Initialize with `npx create-next-app@latest titlecomply --typescript --tailwind --app --src-dir --eslint`
2. Install core dependencies:
   ```
   npm install @clerk/nextjs @prisma/client stripe @stripe/stripe-js zustand @tanstack/react-query react-hook-form @hookform/resolvers zod lucide-react recharts framer-motion clsx tailwind-merge
   npm install -D prisma @types/node
   ```
3. Set up folder structure:
   ```
   src/
   ├── app/
   │   ├── (marketing)/          → Public pages (landing, pricing, about, blog)
   │   ├── (auth)/               → Sign-in, sign-up pages
   │   ├── (app)/                → Authenticated app pages (dashboard, transactions, etc.)
   │   ├── api/                  → API routes
   │   └── layout.tsx            → Root layout
   ├── components/
   │   ├── ui/                   → Base UI components (Button, Input, Card, Badge, Modal, etc.)
   │   ├── layout/               → Navbar, Sidebar, Footer
   │   ├── transactions/         → Transaction-specific components
   │   ├── filings/              → Filing-specific components
   │   └── dashboard/            → Dashboard widgets
   ├── lib/
   │   ├── db.ts                 → Prisma client singleton
   │   ├── encryption.ts         → AES-256-GCM field encryption
   │   ├── audit.ts              → Audit logging with hash chain
   │   ├── screening.ts          → FinCEN screening engine
   │   ├── stripe.ts             → Stripe helpers
   │   ├── claude.ts             → Claude API integration
   │   ├── email.ts              → SendGrid email helpers
   │   ├── utils.ts              → General utilities
   │   └── constants.ts          → App constants, plan definitions
   └── styles/
       └── globals.css           → Tailwind config + custom styles
   ```
4. Configure Tailwind with the brand colors from SPEC.md section 2.
5. Create `.env.example` with all environment variables.
6. Create `prisma/schema.prisma` with the complete schema from SPEC.md section 4.
7. Add `export const dynamic = 'force-dynamic'` to every page.tsx file.
8. Create a basic root layout with Inter font.
9. Create `/api/health` endpoint returning `{ status: "healthy" }`.

Do NOT set up Clerk or Stripe yet — just install the packages. We'll configure auth in Prompt 03.

---

## PROMPT 02 — Design System & UI Components

Reference @file SPEC.md section 2 for colors and design principles.

Build the base UI component library in `src/components/ui/`. These should be clean, professional, dense-information components appropriate for compliance software. No decoration, no gradients. Desktop-first.

Create these components:
1. **Button** — variants: primary (blue), secondary (outline), danger (red), ghost. Sizes: sm, md, lg. Loading state with spinner.
2. **Input** — with label, error message, helper text. Variants: text, email, password, number, date, tel.
3. **Select** — dropdown with label, error message, placeholder.
4. **Textarea** — with label, character count, error message.
5. **Card** — with optional header, footer, padding variants.
6. **Badge** — variants matching transaction statuses: screening (gray), collecting (blue), validating (amber), filed (green), rejected (red), archived (slate).
7. **Modal** — with overlay, close button, title, body, footer actions.
8. **Table** — with sortable headers, row hover, pagination component.
9. **Tabs** — horizontal tabs with active indicator.
10. **Progress** — horizontal progress bar with percentage label.
11. **Alert** — variants: info (blue), success (green), warning (amber), error (red). Dismissible.
12. **Spinner** — loading spinner in sm/md/lg.
13. **EmptyState** — icon + title + description + action button.
14. **StatusDot** — small colored circle for status indicators.
15. **Tooltip** — on hover, positioned auto.
16. **Breadcrumb** — for page navigation hierarchy.

Use `clsx` and `tailwind-merge` for className composition. All components should accept `className` prop for extension.

---

## PROMPT 03 — Authentication (Clerk)

Set up Clerk authentication with multi-tenant organization support.

1. Install and configure `@clerk/nextjs` in the root layout.
2. Create Clerk middleware (`src/middleware.ts`):
   - Public routes: `/`, `/pricing`, `/about`, `/blog(.*)`, `/contact`, `/legal(.*)`, `/api/health`, `/api/webhooks/(.*)`
   - Everything else requires auth.
3. Create sign-in page at `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
4. Create sign-up page at `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
5. Create the app layout at `src/app/(app)/layout.tsx`:
   - Sidebar navigation (left side, collapsible)
   - Top bar with org name, user avatar, notifications bell
   - Sidebar links: Dashboard, Transactions, Filings, Alerts, Reports, Settings
   - Sidebar should show the TitleComply logo at top
6. Create a `resolveUser` helper in `src/lib/auth.ts` that:
   - Gets the Clerk user and org from the request
   - Looks up or creates the User and Organization in our database
   - Returns `{ user, organization }` for use in API routes
7. Create Clerk webhook handler at `/api/webhooks/clerk` that syncs:
   - `user.created` → creates User record
   - `organization.created` → creates Organization record
   - `organizationMembership.created` → links User to Org
8. Add `export const dynamic = 'force-dynamic'` to all page.tsx files.

Environment variables needed: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, CLERK_WEBHOOK_SECRET

---

## PROMPT 04 — Database Setup & Seed Data

1. Run `npx prisma db push` to sync schema to Neon PostgreSQL.
2. Create `prisma/seed.ts` with realistic demo data:
   - 1 organization: "Sunshine Title & Escrow, LLC" (Starter plan, South Florida)
   - 3 users: Admin (Jon), Closer (Sarah), Processor (Mike)
   - 8 transactions in various statuses:
     - 2 in SCREENING
     - 2 in COLLECTING (with partial data)
     - 1 in VALIDATING
     - 1 in READY_TO_FILE
     - 1 in FILED
     - 1 in NO_FILING_REQUIRED
   - 3 filings (draft, validated, generated)
   - Sample beneficial owners and entity details for the transactions that have them
   - 10 audit log entries
   - 3 alerts (1 overdue, 1 missing data, 1 regulation update)
3. Seed properties should be realistic South Florida addresses (Boca Raton, Fort Lauderdale, Miami Beach, Coral Gables).
4. Seed entity names should be realistic LLCs: "Oceanview Holdings LLC", "Palm Capital Group LLC", "Sunshine Investments Trust", etc.
5. Run the seed: `npx tsx prisma/seed.ts`
6. Verify data loads correctly.

---

## PROMPT 05 — Dashboard

Build the main dashboard at `src/app/(app)/dashboard/page.tsx`.

This is the first thing users see after login. It should give a complete compliance overview at a glance.

**Top row — KPI cards (4 across):**
1. Active Transactions (number + "X requiring action" subtitle)
2. Filings This Month (number + bar showing usage vs plan limit)
3. Overdue Items (number, red if > 0)
4. Compliance Score (percentage — files completed on time / total files)

**Middle row — Transaction Pipeline:**
- Horizontal Kanban-style status bar showing count in each status:
  Screening → Collecting → Validating → Ready to File → Filed
- Each status is a clickable card that filters the transactions list
- Color-coded: gray → blue → amber → green → dark green

**Bottom left — Recent Activity Feed:**
- Last 10 audit log entries for the org
- Each entry shows: icon, description, user, timestamp
- "View all" link to full audit log

**Bottom right — Alerts Panel:**
- Active unacknowledged alerts sorted by severity
- Each alert shows severity badge, title, message, acknowledge button
- "View all" link to alerts page

**Quick Actions (floating or in top bar):**
- "New Transaction" button (primary, prominent)
- "Generate Report" button (secondary)

Use Recharts for any charts. Fetch data via Server Components with direct Prisma queries.

---

## PROMPT 06 — Transaction List & Filters

Build the transactions list page at `src/app/(app)/transactions/page.tsx`.

**Layout:**
- Page header: "Transactions" title + "New Transaction" button
- Filter bar (horizontal, always visible):
  - Status dropdown (multi-select: all statuses from the enum)
  - Buyer type dropdown
  - Date range picker (created date)
  - Search box (searches file number, property address, entity name)
  - "Clear filters" button
- Results count: "Showing X of Y transactions"

**Table columns:**
1. File # (or auto-generated ID if no file number)
2. Property Address (truncated with tooltip for full address)
3. Buyer / Entity Name
4. Buyer Type (badge)
5. Status (colored badge)
6. Collection Progress (progress bar, only shown for COLLECTING status)
7. Closing Date
8. Assigned To
9. Created (relative time: "2 hours ago")
10. Actions (kebab menu: View, Edit, Delete)

**Features:**
- Sortable columns (click header to sort)
- Pagination (20 per page)
- Empty state when no transactions: icon + "No transactions yet" + "Create your first transaction" CTA
- Row click navigates to transaction detail
- Bulk actions: select multiple → change status, assign to, delete

---

## PROMPT 07 — New Transaction Wizard (Screening)

Build the new transaction creation flow at `src/app/(app)/transactions/new/page.tsx`.

This is a multi-step wizard that screens the transaction and determines if FinCEN filing is required.

**Step 1 — Property Information:**
- Property address (street, city, county, state, zip)
- Property type (single family, condo, multi-family, townhouse, land, commercial)
- File/order number (optional)

**Step 2 — Buyer Information:**
- Buyer type: Individual, LLC, Corporation, Partnership, Trust, Other Entity
  - If Individual → skip to Step 3
  - If Entity/Trust → continue
- Entity/trust name
- State of formation (dropdown of US states + "Foreign")

**Step 3 — Transaction Details:**
- Purchase price
- Closing date (date picker)
- Financing status:
  - Financed (traditional mortgage from regulated lender)
  - Non-financed (cash, wire, crypto)
  - Partially financed
  - Seller-financed

**Step 4 — Screening Result:**
- Run the screening logic from SPEC.md section 5
- Display result prominently:
  - **REQUIRED** (red banner): "This transaction requires a FinCEN Real Estate Report filing. Proceed to data collection."
  - **NOT REQUIRED** (green banner): "This transaction does not require a FinCEN filing." + explanation
  - **NEEDS REVIEW** (amber banner): "This transaction may require filing. Manual review recommended." + edge case explanation
- Buttons:
  - If REQUIRED: "Start Data Collection →"
  - If NOT REQUIRED: "Archive Transaction" or "Override — Collect Data Anyway"
  - If NEEDS_REVIEW: "Mark as Required" or "Mark as Not Required"

**Backend:**
- POST `/api/transactions` creates the transaction
- POST `/api/transactions/[id]/screen` runs screening and updates the record
- Audit log entry for creation and screening

---

## PROMPT 08 — Data Collection Forms

Build the data collection interface at `src/app/(app)/transactions/[id]/collect/page.tsx`.

This is where the title officer enters all the information required for the FinCEN filing. It's a tabbed form interface.

**Tab 1 — Entity/Trust Information:**
- If entity (LLC/Corp/Partnership):
  - Entity legal name, type, EIN, formation state, formation date
  - Registered agent name and address
  - Principal place of business
  - Business purpose
- If trust:
  - Trust name, type (revocable/irrevocable/land trust), trust date
  - Trustee name and address
  - Grantor name and address
  - EIN

**Tab 2 — Beneficial Owners:**
- List of beneficial owners (25%+ ownership)
- "Add Beneficial Owner" button
- For each owner:
  - First name, last name
  - Date of birth
  - SSN/ITIN (masked input, shows last 4 only)
  - Residential address
  - Ownership percentage
  - ID document: type (driver's license, passport, state ID), number, issuing state/country, expiration
- Ownership percentages must total at least 75% (warn if less)
- At least one beneficial owner required

**Tab 3 — Seller Information:**
- Seller name
- Seller address
- Seller SSN/EIN (if entity)

**Tab 4 — Settlement Agent:**
- Pre-filled from organization settings
- Company name, agent name, license number, address, phone

**Features:**
- Auto-save on field blur (PATCH to API)
- Progress bar at top showing completion percentage
- Required field indicators (red asterisk)
- Inline validation (Zod)
- "Save & Continue Later" button
- "Validate & Proceed" button (runs full validation)
- Sensitive fields (SSN, EIN, DOB) encrypted before storage using lib/encryption.ts

**Backend:**
- PATCH `/api/transactions/[id]` for transaction-level fields
- POST/PATCH `/api/transactions/[id]/beneficial-owners` for owner CRUD
- POST/PATCH `/api/transactions/[id]/entity` for entity details
- POST/PATCH `/api/transactions/[id]/trust` for trust details
- All PII fields encrypted with AES-256-GCM before database write

---

## PROMPT 09 — Document Upload & AI Extraction

Build the document management interface at `src/app/(app)/transactions/[id]/documents/page.tsx`.

**Upload Interface:**
- Drag-and-drop zone + file browser button
- Accept: PDF, JPG, PNG, DOCX
- Max file size: 10MB
- Document type selector: Operating Agreement, Articles of Incorporation, Trust Document, Government ID, etc.
- Upload progress bar
- Multiple file upload support

**Document List:**
- Table of uploaded documents for this transaction
- Columns: filename, type, size, upload date, extraction status, actions
- Extraction status badges: Pending, Processing, Completed, Failed

**AI Extraction:**
- "Extract Data" button on each document
- When clicked:
  1. Show processing spinner
  2. Call POST `/api/documents/[id]/extract`
  3. Backend sends document text to Claude API with extraction prompt from SPEC.md section 6
  4. Store structured JSON result
  5. Show extraction result in a review panel
- Review panel shows extracted data side-by-side with form:
  - Left: extracted values with confidence indicators
  - Right: current form values
  - "Apply" button per field to copy extracted value to form
  - "Apply All" button to fill all fields
  - Highlight low-confidence extractions in amber

**Backend:**
- POST `/api/documents/upload` → returns presigned S3/R2 URL
- POST `/api/documents/[id]/extract` → queues AI extraction job
- GET `/api/documents/[id]` → returns document with extraction result

For MVP, if S3 isn't configured yet, store files locally in `/uploads` or use base64 in the database (temporary). The extraction flow is the key differentiator — make it work.

---

## PROMPT 10 — Validation & Filing Generation

Build the validation and filing generation interface at `src/app/(app)/transactions/[id]/filing/page.tsx`.

**Validation Panel:**
- "Validate Transaction" button
- When clicked, runs comprehensive validation:
  - All required FinCEN fields populated?
  - SSN/EIN format valid?
  - Beneficial ownership percentages make sense?
  - Entity formation details complete?
  - At least one beneficial owner with 25%+ ownership?
  - Property and transaction details complete?
  - Settlement agent information present?
- Display results:
  - ✅ Green checkmarks for passing validations
  - ❌ Red X for failures with specific error messages
  - Links to the specific form tab/field that needs correction
- All validations must pass before filing can be generated

**Filing Generation:**
- "Generate FinCEN Report" button (only enabled when all validations pass)
- When clicked:
  1. Compile all transaction data into the FinCEN report structure (SPEC.md section 7)
  2. Generate PDF using @react-pdf/renderer
  3. Store the filing record in the database
  4. Store PDF in S3/R2
  5. Update transaction status to FILED
  6. Create audit log entry
- Show filing preview (embedded PDF or structured data view)
- "Download PDF" button
- Filing status tracker: Draft → Validated → Generated → Filed → Accepted

**Filing Detail:**
- Summary of all data included in the filing
- PDF download link
- Filing metadata (generated date, generated by, filing ID)
- Amendment option (create corrected filing)

**Backend:**
- POST `/api/transactions/[id]/validate` → runs validation, returns results
- POST `/api/transactions/[id]/generate-filing` → generates filing + PDF
- GET `/api/filings/[id]/pdf` → serves the PDF

---

## PROMPT 11 — Transaction Detail Page

Build the transaction detail page at `src/app/(app)/transactions/[id]/page.tsx`.

This is the hub for a single transaction. Tabbed layout:

**Header:**
- Property address (large)
- File number
- Status badge (prominent)
- Assigned to
- Action buttons: Edit, Delete, Change Status

**Tabs:**
1. **Overview** — Summary card with all key details: property, buyer, screening result, collection progress, filing status
2. **Data Collection** — Links to the collection forms (Prompt 08)
3. **Documents** — Document list and upload (Prompt 09)
4. **Filing** — Validation and filing generation (Prompt 10)
5. **Audit Trail** — Complete history of all actions on this transaction

**Audit Trail Tab:**
- Chronological list of all audit log entries for this transaction
- Each entry: timestamp, user, action, details, IP address
- Hash chain verification indicator (green lock icon if chain is intact)

---

## PROMPT 12 — Filings List & Alerts Pages

**Filings page** at `src/app/(app)/filings/page.tsx`:
- List all generated filings across the organization
- Columns: Filing ID, Transaction/Property, Status, Generated Date, Generated By, Actions
- Filter by status (draft, validated, generated, filed, accepted, rejected)
- "Download PDF" action per filing
- Click to view filing detail

**Alerts page** at `src/app/(app)/alerts/page.tsx`:
- List all alerts for the organization
- Filter by severity, type, acknowledged status
- Columns: Severity (color badge), Type, Title, Message, Transaction Link, Created, Actions
- "Acknowledge" button marks alert as handled
- Bulk acknowledge

---

## PROMPT 13 — Settings Pages

Build settings pages under `src/app/(app)/settings/`:

**Organization Settings** (`/settings`):
- Company name, address, phone, email
- Title agent license number
- Primary title insurance underwriter
- Default reminder interval (days)
- Auto-screen new transactions toggle

**Team Management** (`/settings/team`):
- List of team members: name, email, role, joined date
- "Invite Team Member" button → modal with email + role selector
- Change role dropdown per member
- Remove member (with confirmation)
- Show plan limit: "2 of 2 seats used" (Starter)

**Billing** (`/settings/billing`):
- Current plan display with usage (transactions this month / limit)
- "Upgrade Plan" button → Stripe checkout
- "Manage Billing" button → Stripe customer portal
- Invoice history

**Profile** (`/settings/profile`):
- User name, email (from Clerk)
- Notification preferences (email on: new alerts, filing generated, overdue items)

---

## PROMPT 14 — Stripe Billing Integration

Wire up Stripe for subscription billing.

1. Create Stripe products and prices for all 4 plans.
2. Create checkout session endpoint: POST `/api/stripe/checkout`
   - Creates a Stripe Checkout Session for the selected plan
   - Redirects to Stripe hosted checkout
   - On success, redirects to /dashboard with success message
3. Create customer portal endpoint: POST `/api/stripe/portal`
   - Opens Stripe Customer Portal for managing subscription
4. Create webhook handler: POST `/api/webhooks/stripe`
   - `checkout.session.completed` → update org plan + stripe IDs
   - `customer.subscription.updated` → update plan on up/downgrade
   - `customer.subscription.deleted` → downgrade to no plan, show upgrade banner
   - `invoice.payment_failed` → create alert, send email
5. Add plan gating:
   - Check transaction count vs plan limit before creating new transactions
   - Check user count vs plan limit before inviting team members
   - Show upgrade prompts when approaching limits
6. 14-day trial: new orgs get Starter features for 14 days without payment.

---

## PROMPT 15 — Encryption & Audit Trail

Implement the security infrastructure.

**Field-level encryption** (`src/lib/encryption.ts`):
- AES-256-GCM encryption/decryption functions
- `encrypt(plaintext: string): string` → returns `enc:v1:{iv}:{ciphertext}:{tag}`
- `decrypt(encrypted: string): string` → returns plaintext
- Key from env: `ENCRYPTION_MASTER_KEY` (32-byte hex)
- Apply to all PII fields: SSN, EIN, DOB, ID numbers
- Create Prisma middleware that auto-encrypts on write and auto-decrypts on read for designated fields

**Audit trail** (`src/lib/audit.ts`):
- `logAudit(orgId, userId, action, details, transactionId?, request?)` function
- Computes SHA-256 hash: `hash(previousHash + action + JSON(details) + timestamp)`
- Stores hash chain in AuditLog table
- Actions: `transaction.created`, `transaction.updated`, `transaction.screened`, `document.uploaded`, `document.extracted`, `filing.generated`, `filing.downloaded`, `user.invited`, `settings.updated`
- Add audit calls to all existing API routes (go back through Prompts 07-13 endpoints)

**Hash chain verification:**
- GET `/api/audit/verify/[transactionId]` → walks the chain, returns integrity status
- If any hash doesn't match the computed value → chain is broken (tampering detected)

---

## PROMPT 16 — Email Notifications

Set up SendGrid email system.

1. Create email templates using React Email or HTML templates:
   - **Welcome** — sent on signup
   - **Transaction Created** — sent to assigned closer
   - **Screening Complete** — result notification
   - **Missing Data Reminder** — sent X days after collection started
   - **Filing Generated** — notification with PDF attached
   - **Overdue Alert** — transaction past filing deadline
   - **Team Invitation** — invite link for new team members
   - **Monthly Summary** — compliance report for the month

2. Create `src/lib/email.ts` with SendGrid integration:
   - `sendEmail(to, template, data)` function
   - Graceful fallback if SENDGRID_API_KEY not set (log instead of crash)
   - Email templates should be professional, minimal, with TitleComply branding

3. Wire emails into existing flows:
   - Transaction creation → email to assigned closer
   - Screening complete → email to creator
   - Filing generated → email to creator + admin

---

## PROMPT 17 — Landing Page & Marketing

Build the public marketing site.

**Landing page** at `src/app/(marketing)/page.tsx`:

1. **Hero:** "FinCEN compliance on autopilot for title & escrow."
   - Subtitle: "Every title company in America must now file FinCEN Real Estate Reports on cash-to-entity transactions. TitleComply automates the entire process in 15 minutes."
   - CTA: "Start Free Trial" + "See How It Works"

2. **Problem section:** "The FinCEN Problem"
   - March 1, 2026 rule
   - 22-45 hours per transaction currently
   - Federal penalties for non-compliance
   - Small title shops have no compliance department

3. **How it works:** 4-step visual
   - Screen → Collect → Extract → File
   - Each step with icon and 1-sentence description

4. **Features grid:** 6 features
   - Smart Screening Engine
   - Guided Data Collection
   - AI Document Extraction
   - One-Click Report Generation
   - Tamper-Proof Audit Trail
   - Automated Reminders

5. **Pricing section:** 4 plan cards (from SPEC.md section 8)

6. **Social proof / trust:**
   - "Built for title professionals, by title professionals"
   - Security badges (AES-256, SOC 2 ready, encrypted at rest)
   - "Trusted by X title companies" (placeholder for now)

7. **FAQ section:** 8-10 questions about FinCEN rule, the product, pricing, security

8. **Footer CTA:** "Don't risk non-compliance. Start your free trial today."

**Other marketing pages:**
- `/pricing` — expanded pricing with feature comparison table
- `/about` — company mission, team (Jon's bio), contact
- `/contact` — contact form + demo request
- `/legal/privacy` — privacy policy
- `/legal/terms` — terms of service

---

## PROMPT 18 — SEO & Metadata

1. Add metadata to every page (title, description, OG tags).
2. Create dynamic sitemap at `/sitemap.xml`.
3. Create `/robots.txt`.
4. Add JSON-LD structured data:
   - SoftwareApplication schema on landing page
   - Organization schema
   - FAQPage schema on landing page
5. Blog setup at `/blog` — MDX or database-driven (simpler for MVP: static MDX).
6. Create 3 seed blog posts:
   - "What Title Companies Need to Know About FinCEN's New Real Estate Rule"
   - "How to File a FinCEN Real Estate Report: Step-by-Step Guide"
   - "FinCEN Non-Compliance Penalties: What You Risk by Ignoring the Rule"
7. Each blog post: title, meta description, OG image, content, published date, author.
8. Blog index page with cards.

---

## PROMPT 19 — Polish, Error Handling & Responsive

1. **Error handling:**
   - Global error boundary (`src/app/error.tsx`)
   - Not found page (`src/app/not-found.tsx`)
   - API route error handling middleware (consistent error response format)
   - Loading states on every page (`loading.tsx` files)

2. **Responsive design:**
   - Desktop-first but mobile-usable
   - Sidebar collapses to hamburger on mobile
   - Tables scroll horizontally on mobile
   - Forms stack to single column on mobile
   - Dashboard cards stack on mobile

3. **Polish:**
   - Page transitions (subtle, not distracting)
   - Toast notifications for actions (created, saved, generated, error)
   - Confirmation modals for destructive actions (delete, archive)
   - Empty states on all list pages
   - Skeleton loaders during data fetches
   - Keyboard shortcuts: Ctrl+N for new transaction

---

## PROMPT 20 — Testing, CI/CD & Deploy

1. **Testing:**
   - Vitest unit tests for:
     - Screening engine (all paths: required, not required, needs review)
     - Encryption (encrypt/decrypt roundtrip)
     - Audit trail (hash chain integrity)
     - Validation engine (all required fields)
   - At least 15 tests passing
   - `npm test` runs all tests

2. **CI/CD:**
   - GitHub Actions workflow:
     - On push to master: type-check → test → build
     - Auto-deploy to Netlify on successful build
   - Add GitHub secrets: CLERK keys, DATABASE_URL, etc.

3. **Deploy:**
   - Push to GitHub (new repo: titlecomply)
   - Connect to Netlify
   - Set all environment variables
   - Verify /api/health works
   - Verify landing page loads
   - Verify auth flow works
   - Verify dashboard loads with seed data

4. **Launch checklist:**
   - [ ] All pages load without errors
   - [ ] Auth flow: signup → onboarding → dashboard
   - [ ] Create transaction → screen → collect → file
   - [ ] Document upload works
   - [ ] AI extraction works (with Claude API key)
   - [ ] Filing PDF generates correctly
   - [ ] Stripe checkout works
   - [ ] Emails send (with SendGrid key)
   - [ ] TypeScript clean: `npx tsc --noEmit`
   - [ ] Tests pass: `npm test`
   - [ ] Build succeeds: `npm run build`

---

## EXECUTION ORDER

Week 1: Prompts 01-05 (foundation, auth, database, dashboard)
Week 2: Prompts 06-10 (transaction CRUD, screening, data collection, filing)
Week 3: Prompts 11-16 (detail pages, billing, security, email)
Week 4: Prompts 17-20 (marketing, SEO, polish, deploy)

Execute one prompt at a time. After each prompt:
1. `npx tsc --noEmit` (must pass)
2. Test the feature manually
3. `git add -A && git commit -m "Prompt XX: description"`
4. Move to next prompt

---
