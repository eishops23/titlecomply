# TitleComply — Full Project Specification
## AI-Powered FinCEN Compliance Automation for Title & Escrow
### Version 1.0 | March 2026

---

## 1. PRODUCT OVERVIEW

**Name:** TitleComply
**Domain:** titlecomply.com
**Tagline:** "FinCEN compliance on autopilot for title & escrow."

**What it is:** A B2B SaaS platform that automates FinCEN Real Estate Report compliance for title companies, escrow officers, settlement agents, and real estate attorneys. When FinCEN's anti-money laundering rule (31 CFR Part 1031, effective March 1, 2026) requires a filing on a non-financed real estate transfer to an entity or trust, TitleComply handles the entire workflow: screening, data collection, AI document extraction, validation, report generation, and audit trail.

**Target user:** Title officers and escrow closers at small-to-mid title companies (2-50 employees) who lack a dedicated compliance department.

**Core promise:** Turn a 3-hour manual compliance process into 15 minutes.

---

## 2. TECH STACK

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, TypeScript, Server Components) |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (Neon) + Prisma ORM |
| Auth | Clerk (multi-tenant, RBAC, MFA) |
| Payments | Stripe (subscriptions + usage-based metering) |
| AI | Anthropic Claude API (document extraction, compliance Q&A) |
| Email | SendGrid (transactional notifications, reminders) |
| Queue | BullMQ + Redis (background jobs) |
| Storage | Cloudflare R2 or AWS S3 (document uploads, generated reports) |
| PDF | @react-pdf/renderer (FinCEN report generation) |
| Forms | React Hook Form + Zod validation |
| State | Zustand (client state) + React Query (server state) |
| Icons | Lucide React |
| Charts | Recharts (dashboard analytics) |
| Hosting | Netlify (serverless, same as Palm Realty) |
| Monitoring | Sentry (error tracking) |
| Testing | Vitest (unit) + Playwright (E2E) |

### Design System

**Brand Colors:**
- Primary: `#1E3A5F` (deep navy — trust, authority, compliance)
- Accent: `#2563EB` (bright blue — action, links, CTAs)
- Success: `#059669` (green — compliant, complete, filed)
- Warning: `#D97706` (amber — attention needed, pending)
- Danger: `#DC2626` (red — overdue, non-compliant, error)
- Background: `#F8FAFC` (light slate)
- Surface: `#FFFFFF` (white cards)
- Text: `#0F172A` (slate-900)
- Muted: `#64748B` (slate-500)

**Typography:**
- Headings: Inter (600/700 weight)
- Body: Inter (400/500 weight)
- Mono: JetBrains Mono (code, IDs, hashes)

**Design Principles:**
- Clean, professional, no-nonsense — this is compliance software for conservative buyers
- Dense information display — title officers want data, not whitespace
- Status colors everywhere — green/yellow/red at a glance
- Zero decoration — no gradients, no illustrations, no parallax
- Mobile-responsive but desktop-first (title officers work on desktops)

---

## 3. INFORMATION ARCHITECTURE

### Public Pages (Marketing)
```
/                        → Landing page (hero, problem, solution, pricing, FAQ, CTA)
/pricing                 → Detailed pricing with feature comparison
/about                   → Company story, team, mission
/blog                    → SEO content hub (FinCEN guides, compliance tips)
/blog/[slug]             → Individual blog post
/contact                 → Contact form + demo request
/legal/privacy           → Privacy policy
/legal/terms             → Terms of service
/legal/security          → Security practices page
```

### Auth Pages
```
/sign-in                 → Clerk sign-in
/sign-up                 → Clerk sign-up (→ onboarding)
/sign-up/verify          → Email verification
```

### App Pages (Authenticated)
```
/dashboard               → Overview: active files, alerts, stats, recent activity
/transactions            → Transaction list (filterable, sortable, searchable)
/transactions/new        → New transaction intake (screening wizard)
/transactions/[id]       → Transaction detail (tabbed: overview, data, documents, filing, audit)
/transactions/[id]/screening    → Screening result detail
/transactions/[id]/collect      → Data collection forms
/transactions/[id]/documents    → Document uploads + AI extraction
/transactions/[id]/filing       → Filing report preview + generation
/transactions/[id]/audit        → Audit trail for this transaction
/filings                 → All generated filings (filterable by status)
/filings/[id]            → Filing detail + PDF download
/alerts                  → Compliance alerts and overdue items
/reports                 → Monthly/quarterly compliance summary reports
/settings                → Organization settings
/settings/team           → Team member management (invite, roles)
/settings/billing        → Stripe billing portal
/settings/profile        → User profile
/settings/notifications  → Notification preferences
/settings/security       → Security settings (MFA, sessions)
/help                    → Help center / FAQ
```

### API Routes
```
POST   /api/transactions              → Create new transaction
GET    /api/transactions              → List transactions (with filters)
GET    /api/transactions/[id]         → Get transaction detail
PATCH  /api/transactions/[id]         → Update transaction
DELETE /api/transactions/[id]         → Soft-delete transaction

POST   /api/transactions/[id]/screen  → Run FinCEN screening
POST   /api/transactions/[id]/collect → Save data collection progress
POST   /api/transactions/[id]/validate → Validate collected data
POST   /api/transactions/[id]/generate-filing → Generate FinCEN report

POST   /api/documents/upload          → Upload document (presigned URL)
POST   /api/documents/[id]/extract    → AI extraction from document
GET    /api/documents/[id]            → Get document detail

GET    /api/filings                   → List all filings
GET    /api/filings/[id]              → Get filing detail
GET    /api/filings/[id]/pdf          → Download filing PDF
PATCH  /api/filings/[id]/status       → Update filing status

GET    /api/dashboard/stats           → Dashboard statistics
GET    /api/dashboard/alerts          → Active alerts
GET    /api/dashboard/activity        → Recent activity feed

POST   /api/team/invite               → Invite team member
PATCH  /api/team/[id]/role            → Update member role
DELETE /api/team/[id]                 → Remove team member

GET    /api/audit/[transactionId]     → Audit trail for transaction
GET    /api/reports/monthly           → Monthly compliance report
GET    /api/reports/export            → Export compliance data (CSV)

POST   /api/webhooks/stripe           → Stripe webhook handler
POST   /api/webhooks/clerk            → Clerk webhook handler

GET    /api/health                    → Health check
```

---

## 4. DATABASE SCHEMA

### Organizations & Users (Clerk-managed, extended in DB)

```prisma
model Organization {
  id                String   @id @default(uuid())
  clerk_org_id      String   @unique
  name              String
  plan              Plan     @default(STARTER)
  stripe_customer_id    String?  @unique
  stripe_subscription_id String? @unique
  trial_ends_at     DateTime?
  
  // Company details
  company_name      String?
  company_address   String?
  company_city      String?
  company_state     String?
  company_zip       String?
  company_phone     String?
  company_email     String?
  license_number    String?   // Title agent license
  underwriter       String?   // Primary title insurance underwriter
  
  // Settings
  default_reminder_days  Int      @default(3)
  auto_screen            Boolean  @default(true)
  
  // Limits
  monthly_transaction_limit  Int  @default(25)
  monthly_transaction_count  Int  @default(0)
  limit_reset_at            DateTime?
  
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  
  users             User[]
  transactions      Transaction[]
  filings           Filing[]
  audit_logs        AuditLog[]
  alerts            Alert[]
}

enum Plan {
  STARTER        // $199/mo — 25 transactions, 2 users
  PROFESSIONAL   // $499/mo — 100 transactions, 10 users
  ENTERPRISE     // $999/mo — unlimited
  PAY_PER_FILE   // $29/filing
}

model User {
  id              String   @id @default(uuid())
  clerk_user_id   String   @unique
  org_id          String
  organization    Organization @relation(fields: [org_id], references: [id])
  
  email           String
  first_name      String?
  last_name       String?
  role            UserRole @default(CLOSER)
  
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
  
  transactions    Transaction[]  @relation("AssignedTo")
  created_transactions Transaction[] @relation("CreatedBy")
  audit_logs      AuditLog[]
  
  @@unique([org_id, email])
}

enum UserRole {
  ADMIN           // Full access, billing, team management
  COMPLIANCE_OFFICER // View all, manage filings, run reports
  CLOSER          // Create/edit own transactions, generate filings
  PROCESSOR       // Data entry, document upload
  READ_ONLY       // View only (for auditors)
}
```

### Transactions

```prisma
model Transaction {
  id                String   @id @default(uuid())
  org_id            String
  organization      Organization @relation(fields: [org_id], references: [id])
  
  // File reference
  file_number       String?  // Internal file/order number
  
  // Assignment
  assigned_to_id    String?
  assigned_to       User?    @relation("AssignedTo", fields: [assigned_to_id], references: [id])
  created_by_id     String
  created_by        User     @relation("CreatedBy", fields: [created_by_id], references: [id])
  
  // Status
  status            TransactionStatus @default(SCREENING)
  
  // Property
  property_address  String
  property_city     String
  property_county   String
  property_state    String
  property_zip      String
  
  // Transaction details
  purchase_price    Decimal?  @db.Decimal(12, 2)
  closing_date      DateTime?
  
  // Screening
  buyer_type        BuyerType?
  financing_status  FinancingStatus?
  screening_result  ScreeningResult?
  screening_reason  String?          // AI-generated explanation
  screened_at       DateTime?
  
  // Data collection
  data_collection   Json?            // Structured JSON of all collected fields
  collection_progress Float @default(0) // 0-100 percentage
  
  // Notes
  notes             String?
  
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  
  // Relations
  beneficial_owners BeneficialOwner[]
  entity_detail     EntityDetail?
  trust_detail      TrustDetail?
  documents         Document[]
  filings           Filing[]
  audit_logs        AuditLog[]
  reminders         Reminder[]
  alerts            Alert[]
  
  @@index([org_id, status])
  @@index([org_id, created_at])
  @@index([assigned_to_id])
}

enum TransactionStatus {
  SCREENING         // Initial intake, running screening
  REQUIRES_FILING   // Screening says YES — needs data collection
  NO_FILING_REQUIRED // Screening says NO — archived
  COLLECTING        // Gathering beneficial ownership + entity data
  VALIDATING        // Data complete, running validation checks
  READY_TO_FILE     // Validated, filing can be generated
  FILED             // Filing generated and submitted
  ACCEPTED          // FinCEN accepted the filing
  REJECTED          // FinCEN rejected — needs correction
  ARCHIVED          // Closed and archived
}

enum BuyerType {
  INDIVIDUAL
  LLC
  CORPORATION
  PARTNERSHIP
  TRUST
  OTHER_ENTITY
}

enum FinancingStatus {
  FINANCED          // Traditional mortgage — generally exempt
  NON_FINANCED      // Cash/wire — potentially reportable
  PARTIAL_FINANCING // Mixed — needs further screening
  SELLER_FINANCED   // Seller carry-back — needs screening
}

enum ScreeningResult {
  REQUIRED          // Filing is required
  NOT_REQUIRED      // Filing is not required
  NEEDS_REVIEW      // Edge case — manual review needed
}
```

### Beneficial Owners & Entity Details

```prisma
model BeneficialOwner {
  id                String   @id @default(uuid())
  transaction_id    String
  transaction       Transaction @relation(fields: [transaction_id], references: [id], onDelete: Cascade)
  
  // Identity (encrypted at field level)
  first_name        String
  last_name         String
  date_of_birth     String?  // Encrypted
  ssn_itin          String?  // Encrypted — AES-256-GCM
  
  // Address
  address           String?
  city              String?
  state             String?
  zip               String?
  country           String   @default("US")
  
  // Ownership
  ownership_percentage  Float
  ownership_type        String?  // Direct, indirect, through another entity
  
  // ID Document
  id_type           String?  // Drivers license, passport, state ID
  id_number         String?  // Encrypted
  id_state          String?
  id_country        String?
  id_expiration     DateTime?
  
  // Verification
  verified          Boolean  @default(false)
  verified_by       String?
  verified_at       DateTime?
  
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  
  @@index([transaction_id])
}

model EntityDetail {
  id                String   @id @default(uuid())
  transaction_id    String   @unique
  transaction       Transaction @relation(fields: [transaction_id], references: [id], onDelete: Cascade)
  
  entity_name       String
  entity_type       BuyerType
  
  // Formation
  formation_state   String?
  formation_country String   @default("US")
  formation_date    DateTime?
  
  // Identifiers (encrypted)
  ein               String?  // Encrypted — AES-256-GCM
  state_registration_number String?
  
  // Registered agent
  registered_agent_name    String?
  registered_agent_address String?
  
  // Operating details
  principal_place_of_business String?
  business_purpose  String?
  
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
}

model TrustDetail {
  id                String   @id @default(uuid())
  transaction_id    String   @unique
  transaction       Transaction @relation(fields: [transaction_id], references: [id], onDelete: Cascade)
  
  trust_name        String
  trust_date        DateTime?  // Date trust was established
  trust_type        String?    // Revocable, irrevocable, land trust, etc.
  
  // Parties
  trustee_name      String?
  trustee_address   String?
  grantor_name      String?
  grantor_address   String?
  
  // Beneficiaries stored as JSON array
  beneficiaries     Json?
  
  // Tax ID (encrypted)
  ein               String?  // Encrypted
  
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
}
```

### Documents & AI Extraction

```prisma
model Document {
  id                String   @id @default(uuid())
  transaction_id    String
  transaction       Transaction @relation(fields: [transaction_id], references: [id], onDelete: Cascade)
  
  // File info
  file_name         String
  file_type         String    // pdf, jpg, png, docx
  file_size         Int       // bytes
  file_url          String    // S3/R2 URL
  
  // Document classification
  document_type     DocumentType
  
  // AI Extraction
  extraction_status ExtractionStatus @default(PENDING)
  extraction_result Json?     // Structured data extracted by Claude
  extraction_confidence Float? // 0-1 confidence score
  extracted_at      DateTime?
  
  // Verification
  verified          Boolean   @default(false)
  verified_by       String?
  verified_at       DateTime?
  
  uploaded_by       String    // User ID
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt
  
  @@index([transaction_id])
}

enum DocumentType {
  OPERATING_AGREEMENT
  ARTICLES_OF_INCORPORATION
  ARTICLES_OF_ORGANIZATION
  TRUST_DOCUMENT
  TRUST_AMENDMENT
  CERTIFICATE_OF_GOOD_STANDING
  EIN_LETTER
  GOVERNMENT_ID
  PASSPORT
  PURCHASE_AGREEMENT
  SETTLEMENT_STATEMENT
  WIRE_INSTRUCTIONS
  OTHER
}

enum ExtractionStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  SKIPPED
}
```

### Filings

```prisma
model Filing {
  id                String   @id @default(uuid())
  org_id            String
  organization      Organization @relation(fields: [org_id], references: [id])
  transaction_id    String
  transaction       Transaction @relation(fields: [transaction_id], references: [id])
  
  // Filing data
  filing_data       Json     // Complete structured data for the FinCEN report
  filing_type       String   @default("REAL_ESTATE_REPORT")
  
  // Status
  status            FilingStatus @default(DRAFT)
  
  // Generated PDF
  pdf_url           String?
  
  // Filing submission
  filed_at          DateTime?
  confirmation_number String?
  rejection_reason  String?
  
  // Validation
  validation_errors Json?    // Array of validation error messages
  validated_at      DateTime?
  
  generated_by      String   // User ID
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  
  @@index([org_id, status])
  @@index([transaction_id])
}

enum FilingStatus {
  DRAFT
  VALIDATED
  GENERATED
  FILED
  ACCEPTED
  REJECTED
  AMENDED
}
```

### Audit, Alerts, Reminders

```prisma
model AuditLog {
  id                String   @id @default(uuid())
  org_id            String
  organization      Organization @relation(fields: [org_id], references: [id])
  user_id           String?
  user              User?    @relation(fields: [user_id], references: [id])
  transaction_id    String?
  
  action            String    // e.g., "transaction.created", "filing.generated", "document.uploaded"
  details           Json?     // Action-specific details
  ip_address        String?
  user_agent        String?
  
  // Tamper-evident hash chain
  previous_hash     String?
  current_hash      String    // SHA-256(previous_hash + action + details + timestamp)
  
  created_at        DateTime  @default(now())
  
  @@index([org_id, created_at])
  @@index([transaction_id])
}

model Alert {
  id                String   @id @default(uuid())
  org_id            String
  organization      Organization @relation(fields: [org_id], references: [id])
  transaction_id    String?
  transaction       Transaction? @relation(fields: [transaction_id], references: [id])
  
  type              AlertType
  severity          AlertSeverity
  title             String
  message           String
  
  // Status
  acknowledged      Boolean  @default(false)
  acknowledged_by   String?
  acknowledged_at   DateTime?
  
  created_at        DateTime @default(now())
  
  @@index([org_id, acknowledged])
}

enum AlertType {
  OVERDUE_FILING
  MISSING_DATA
  SCREENING_REQUIRED
  FILING_REJECTED
  SUBSCRIPTION_EXPIRING
  MONTHLY_LIMIT_APPROACHING
  REGULATION_UPDATE
}

enum AlertSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

model Reminder {
  id                String   @id @default(uuid())
  transaction_id    String
  transaction       Transaction @relation(fields: [transaction_id], references: [id], onDelete: Cascade)
  
  type              String    // "missing_data", "overdue_filing", "document_request"
  recipient_email   String
  subject           String
  body              String
  
  sent              Boolean  @default(false)
  sent_at           DateTime?
  scheduled_for     DateTime
  
  created_at        DateTime @default(now())
  
  @@index([scheduled_for, sent])
}
```

---

## 5. FINCEN SCREENING LOGIC

The screening engine determines whether a transaction requires a FinCEN Real Estate Report filing.

### Decision Tree

```
START
│
├─ Is this a RESIDENTIAL real estate transfer?
│  ├─ NO → NOT REQUIRED (commercial exempt for now)
│  └─ YES ↓
│
├─ Is the buyer a LEGAL ENTITY or TRUST?
│  ├─ NO (individual person) → NOT REQUIRED
│  └─ YES ↓
│
├─ Is the transaction FINANCED by a regulated lender?
│  ├─ YES (traditional mortgage from bank/credit union) → NOT REQUIRED
│  │   (Lender already files SAR/CTR under existing BSA rules)
│  └─ NO or PARTIALLY ↓
│
├─ Is the transfer for consideration (i.e., a purchase, not a gift)?
│  ├─ NO (gift, inheritance, court order) → NEEDS REVIEW
│  └─ YES ↓
│
└─ FILING REQUIRED
   → Collect beneficial ownership data
   → Collect entity/trust details
   → Generate FinCEN Real Estate Report
```

### Edge Cases (NEEDS_REVIEW triggers)
- Seller-financed transactions
- Partial financing (e.g., 50% cash + 50% private loan)
- Transfers between related entities
- Foreclosure sales
- 1031 exchanges involving entities
- Foreign entity buyers
- Multi-party entity structures (entity buying through entity)

---

## 6. AI DOCUMENT EXTRACTION

When a user uploads an operating agreement, trust document, or articles of incorporation, the system uses Claude to extract structured data.

### Extraction Prompt Template

```
You are a legal document extraction specialist. Extract the following information from this document and return it as JSON.

For Operating Agreements / Articles of Organization:
{
  "entity_name": "",
  "entity_type": "LLC | Corporation | Partnership",
  "formation_state": "",
  "formation_date": "",
  "ein": "",
  "registered_agent": { "name": "", "address": "" },
  "members": [
    { "name": "", "ownership_percentage": 0, "role": "Member | Manager | Managing Member" }
  ],
  "principal_place_of_business": ""
}

For Trust Documents:
{
  "trust_name": "",
  "trust_type": "Revocable | Irrevocable | Land Trust | Other",
  "trust_date": "",
  "trustee": { "name": "", "address": "" },
  "grantor": { "name": "", "address": "" },
  "beneficiaries": [
    { "name": "", "relationship": "", "percentage": 0 }
  ],
  "ein": ""
}

If a field cannot be determined from the document, set it to null.
Return ONLY valid JSON, no explanation.
```

### Extraction Workflow
1. User uploads document → stored in S3/R2
2. Background job picks up the document
3. Convert PDF to text (pdf-parse) or send image to Claude vision
4. Send text + extraction prompt to Claude API
5. Parse response JSON, validate structure
6. Store extraction_result on Document record
7. Pre-fill the data collection form with extracted values
8. Flag low-confidence extractions for human review
9. User reviews, confirms, and corrects as needed

---

## 7. FILING REPORT GENERATION

### FinCEN Real Estate Report Fields

The generated PDF must include these sections:

**Part I — Filing Information**
- Type of filing (initial, corrected, amended)
- Filing date

**Part II — Transaction Information**
- Property address
- Date of closing
- Purchase price
- Type of property (single family, condo, multi-family, land)

**Part III — Transferee (Buyer) Information**
- Entity/trust name
- Entity type
- EIN
- Formation state and date
- Principal business address

**Part IV — Beneficial Ownership Information**
- For each 25%+ owner:
  - Full legal name
  - Date of birth
  - SSN/ITIN (or foreign equivalent)
  - Residential address
  - ID document type, number, issuing jurisdiction

**Part V — Transferor (Seller) Information**
- Name
- Address
- SSN/EIN if entity

**Part VI — Settlement Agent Information**
- Company name
- Agent name
- License number
- Address
- Phone

---

## 8. PRICING & BILLING

### Plans

| Feature | Starter ($199/mo) | Professional ($499/mo) | Enterprise ($999/mo) | Per-File ($29/ea) |
|---------|-------------------|----------------------|---------------------|-------------------|
| Transactions/month | 25 | 100 | Unlimited | Pay per use |
| Users | 2 | 10 | Unlimited | 1 |
| Screening engine | ✅ | ✅ | ✅ | ✅ |
| Data collection | ✅ | ✅ | ✅ | ✅ |
| Filing generation | ✅ | ✅ | ✅ | ✅ |
| Audit trail | ✅ | ✅ | ✅ | ✅ |
| AI doc extraction | ❌ | ✅ | ✅ | ❌ |
| API access | ❌ | ❌ | ✅ | ❌ |
| Multi-office | ❌ | ❌ | ✅ | ❌ |
| White-label | ❌ | ❌ | ✅ | ❌ |
| Priority support | ❌ | ✅ | ✅ | ❌ |
| Custom integrations | ❌ | ❌ | ✅ | ❌ |

### Stripe Configuration
- Products: titlecomply_starter, titlecomply_professional, titlecomply_enterprise, titlecomply_per_file
- Subscription billing: monthly with annual discount (2 months free)
- Usage metering: track transaction count per org per month
- Webhook events: customer.subscription.created, updated, deleted, invoice.paid, invoice.payment_failed

---

## 9. SECURITY REQUIREMENTS

### Encryption
- All PII fields (SSN, EIN, DOB, ID numbers) encrypted with AES-256-GCM
- Encryption key derived from org-specific key + master key
- Key rotation support
- Encrypted fields stored as `enc:v1:iv:ciphertext:tag` format

### Authentication & Authorization
- Clerk handles auth (MFA, OAuth, magic links)
- RBAC enforced at API route level
- Org isolation — users can only access their org's data
- Session management with automatic expiry

### API Security
- All routes require authentication (except /api/health, /api/webhooks/*)
- Rate limiting: 100 req/min per user, 1000 req/min per org
- CSRF protection on all mutations
- Input validation with Zod on every endpoint
- SQL injection prevention via Prisma parameterized queries

### Audit
- Every data modification logged with user, timestamp, IP, action
- Hash chain on audit log (each entry includes hash of previous entry)
- Audit logs are append-only (no updates or deletes)
- 5-year retention (configurable per plan)

### Infrastructure
- HTTPS only (HSTS headers)
- CSP headers
- XSS prevention
- No sensitive data in URLs or logs
- Database connection via SSL
- Environment variables for all secrets

---

## 10. DEVELOPMENT METHODOLOGY

### Rules (STRICTLY ENFORCED)
1. **Audit before coding** — Read the current state of any file before modifying it
2. **TypeScript strict** — No `any` types, no `@ts-ignore`
3. **Zod validation** — Every API endpoint validates input with Zod
4. **Error handling** — Every async operation wrapped in try/catch
5. **No `prisma migrate`** — Use `prisma db push` for schema changes, manual SQL for data migrations
6. **Test before commit** — `npx tsc --noEmit` must pass before every commit
7. **Server Components default** — Only use `'use client'` when hooks/interactivity is required
8. **`export const dynamic = 'force-dynamic'`** — On every page.tsx (prevents Netlify prerender failures)
9. **Atomic commits** — One feature per commit, descriptive messages
10. **No breaking changes** — Every commit should leave the app in a working state

---

## 11. ONBOARDING FLOW

### New User Signup → First Filing (under 10 minutes)

1. **Sign up** (Clerk) → email/password or Google
2. **Create organization** → company name, state, license number
3. **Select plan** → Stripe checkout (or start 14-day trial)
4. **Dashboard** → Welcome banner with "Create Your First Transaction" CTA
5. **New transaction** → Property address + buyer type + financing status
6. **Screening** → Instant YES/NO/REVIEW result
7. **Data collection** → Guided forms for entity + beneficial owners
8. **Upload documents** → Operating agreement → AI extracts → pre-fills form
9. **Validate** → System checks all required fields
10. **Generate filing** → PDF ready for download/submission
11. **Done** → Transaction moves to FILED status, audit trail complete

---

## 12. BACKGROUND JOBS

| Job | Schedule | Description |
|-----|----------|-------------|
| `send-reminders` | Every hour | Send email reminders for missing data on active transactions |
| `check-overdue` | Daily 8am | Flag transactions with filing deadlines approaching |
| `reset-monthly-counts` | 1st of month | Reset monthly transaction counts per org |
| `cleanup-expired-trials` | Daily midnight | Downgrade expired trial organizations |
| `generate-monthly-report` | 1st of month | Generate compliance summary for previous month |
| `regulation-monitor` | Weekly | Check for FinCEN rule changes/updates |

---
