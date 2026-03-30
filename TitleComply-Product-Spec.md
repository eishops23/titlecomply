# TitleComply — Product Specification
## AI-Powered FinCEN Compliance Automation for Title & Escrow
### Version 1.0 | March 29, 2026

---

## The Name: TitleComply

**Domain options (check availability on Namecheap):**
- `titlecomply.com` ← first choice (exact keyword match: "title" + "comply")
- `titlecomply.co` ← backup
- `titlecomply.io` ← tech-forward alternative

**Why TitleComply wins on SEO:**
- Direct keyword match for "title company compliance" (2,400 monthly searches)
- Ranks naturally for "FinCEN title compliance," "title escrow compliance software," "AML real estate compliance"
- Mirrors the AICompliant brand architecture (industry + compliant/comply)
- Memorable, professional, says exactly what it does
- Two syllables + one word = easy to say on a sales call

**Tagline:** "FinCEN compliance on autopilot for title & escrow."

---

## Problem Statement

On March 1, 2026, FinCEN's new anti-money laundering rule (31 CFR Part 1031) took effect, requiring settlement professionals to:

1. **Identify qualifying transactions** — non-financed residential real estate transfers to legal entities or trusts
2. **Collect specific data** — beneficial ownership information, entity details, source of funds
3. **File a Real Estate Report** — new form submitted to FinCEN for each qualifying transaction
4. **Maintain records** — 5-year retention with full audit trail
5. **Train staff** — ongoing compliance education

**Who's affected:** Every title company, escrow officer, settlement agent, and real estate attorney in the United States handling entity/trust purchases.

**Current state:** Most of the ~30,000 title/escrow companies in the US are small shops (2-15 employees) with no compliance department. They're handling this with:
- Manual checklists and spreadsheets
- Hoping they don't get audited
- Paying expensive attorneys hourly to figure it out
- Ignoring it entirely (risky)

**The pain:**
- Title professionals already spend 22-45 hours per transaction on standard closing work
- Adding manual compliance steps increases time by 2-4 hours per qualifying file
- A single missed filing means federal penalties
- No affordable, purpose-built tool exists for small/mid title shops
- Qualia (the market leader in title tech) is enterprise-priced and overkill for this specific need

---

## Solution: TitleComply

A standalone SaaS platform that automates FinCEN real estate reporting compliance for title and escrow companies. Think "TurboTax for FinCEN real estate filings."

### Core Value Proposition
- **For the title officer:** Open a file → answer 3 screening questions → system tells you if filing is required → auto-generates data collection forms → tracks completion → validates data → generates the report → stores everything with an audit trail
- **Time saved:** 2-4 hours per qualifying transaction reduced to 15 minutes
- **Risk eliminated:** Zero missed filings, zero incomplete data, full audit trail for examiner review

---

## Feature Set

### Phase 1: MVP (Weeks 1-4) — Launch Target

#### 1. Transaction Screening Engine
- New transaction intake form: property address, buyer type (individual/entity/trust), financing status
- Decision tree logic: automatically determines if FinCEN reporting is required
- Clear YES/NO/MAYBE result with explanation
- "Maybe" triggers guided questionnaire for edge cases
- Stores screening decision with timestamp for audit trail

#### 2. Data Collection Workflow
- Dynamic forms that adapt based on entity type (LLC, corporation, trust, partnership)
- Required fields mapped directly to FinCEN Real Estate Report specifications:
  - Beneficial ownership information (25%+ owners)
  - Entity formation details (state, EIN, formation date)
  - Trust details (trustee, grantor, beneficiary information)
  - Property details (address, purchase price, date of closing)
  - Source of funds documentation
  - Settlement agent information
- Progress tracker showing completion percentage per file
- Missing data alerts with automated reminder emails to requesting parties
- Document upload for supporting evidence (operating agreements, trust documents, IDs)

#### 3. AI Document Extraction
- Upload an operating agreement, trust document, or articles of incorporation
- AI extracts: entity name, formation state, EIN, registered agent, beneficial owners, ownership percentages
- Pre-fills the FinCEN data collection form
- Human reviews and confirms before submission
- Powered by Claude API (already have access via AICompliant infrastructure)

#### 4. Report Generation
- Auto-generates the FinCEN Real Estate Report form with all collected data
- Validation engine checks all required fields before generation
- PDF output matching FinCEN specifications
- Export in FinCEN's required filing format (when electronic filing opens)
- Batch generation for firms with multiple qualifying transactions

#### 5. Audit Trail & Record Retention
- Every action logged: who, what, when, from where
- 5-year automatic record retention (exceeds FinCEN's requirement)
- Tamper-evident audit log (hash chain)
- One-click audit package: generates a complete compliance record for any transaction
- Examiner view: read-only access for compliance auditors

#### 6. Dashboard & Reporting
- Active transactions pipeline with status indicators
- Overdue filings alerts (red/yellow/green)
- Monthly compliance summary report
- Filing statistics (total transactions screened, filings generated, completion rate)
- Team activity log

### Phase 2: Growth (Months 2-3)

#### 7. Wire Fraud Prevention Layer
- Secure wire instruction verification
- Identity verification for all parties
- Suspicious activity flagging
- Integrates with existing closing workflow

#### 8. Team Management
- Role-based access (admin, closer, processor, read-only)
- File assignment and routing
- Compliance officer oversight dashboard
- Training tracker (records staff completion of compliance modules)

#### 9. Integration Layer
- API for title production software (Qualia, SoftPro, RamQuest, ResWare)
- Webhook notifications for status changes
- CSV/batch import from existing systems
- Zapier integration for smaller shops

#### 10. Compliance Knowledge Base
- AI-powered Q&A about FinCEN rules
- Regulation updates pushed to users
- Decision guidance for edge cases
- Built from regulatory scanning engine (reuse AICompliant's LegiScan/Congress.gov infrastructure)

### Phase 3: Enterprise (Months 4-6)

#### 11. Multi-Office Management
- Parent company views across all branches
- Consolidated compliance reporting
- Centralized policy management
- White-label option for title insurance underwriters

#### 12. State-Specific Compliance
- State-by-state closing requirement variations
- Good Funds laws tracking
- Remote Online Notarization (RON) compliance by state
- Transfer tax calculations

#### 13. SAR Integration
- Suspicious Activity Report filing when FinCEN screening reveals red flags
- Currency Transaction Report triggers
- BSA/AML program documentation
- Risk scoring per transaction

---

## Technical Architecture

### Stack (Reuse from AICompliant)
- **Framework:** Next.js 15 (App Router, TypeScript)
- **Database:** PostgreSQL (Neon) + Prisma ORM
- **Auth:** Clerk (multi-tenant, RBAC)
- **Payments:** Stripe (subscription + per-transaction metering)
- **Email:** SendGrid (transactional notifications)
- **AI:** Anthropic Claude API (document extraction, compliance Q&A)
- **Queue:** BullMQ + Redis (background jobs, reminder emails)
- **Storage:** S3/R2 (document uploads, generated reports)
- **Hosting:** Netlify or Vercel (serverless)
- **Monitoring:** Sentry + BetterStack

### Database Schema (Core Models)

```
Organization          — title company account (name, plan, settings)
User                  — team members with roles
Transaction           — individual real estate file/closing
  ├── screening_result     — YES/NO/MAYBE + reasoning
  ├── buyer_type           — individual/entity/trust
  ├── financing_status     — financed/non-financed/cash
  ├── property_address     — full address + county
  ├── purchase_price       — decimal
  ├── closing_date         — date
  └── status               — screening/collecting/validating/filed/archived
BeneficialOwner       — persons with 25%+ ownership
  ├── name, dob, ssn (encrypted), address
  ├── ownership_percentage
  └── id_document_url
EntityDetail          — LLC/corp/trust information
  ├── entity_name, type, ein (encrypted)
  ├── formation_state, formation_date
  └── registered_agent
TrustDetail           — trust-specific fields
  ├── trust_name, trust_date
  ├── trustee_info, grantor_info
  └── beneficiary_info
Document              — uploaded files (operating agreements, IDs, trust docs)
  ├── file_url, file_type, file_size
  ├── ai_extraction_result (JSON)
  └── verified_by, verified_at
FilingReport          — generated FinCEN reports
  ├── report_data (JSON)
  ├── pdf_url
  ├── filing_status         — draft/validated/filed/accepted/rejected
  └── filed_at
AuditLog              — tamper-evident activity log
  ├── user_id, action, details
  ├── ip_address, timestamp
  └── previous_hash, current_hash
ComplianceAlert       — overdue/missing data notifications
Reminder              — automated email/SMS reminders
```

### Security (Enterprise-grade from Day 1)
- AES-256-GCM encryption for all PII (SSN, EIN, beneficial owner data)
- Field-level encryption in database (not just at-rest)
- SOC 2 Type II readiness from architecture level
- RBAC with principle of least privilege
- IP allowlisting option for enterprise
- Session management with MFA support
- All API endpoints rate-limited
- CSRF protection on all mutations
- CSP headers, XSS prevention
- Audit log with cryptographic hash chain

---

## Business Model

### Pricing Tiers

| Plan | Price | Includes | Target |
|------|-------|----------|--------|
| **Starter** | $199/month | 25 transactions/mo, 2 users, screening + filing | Solo closers, small shops |
| **Professional** | $499/month | 100 transactions/mo, 10 users, AI extraction, integrations | Mid-size title companies |
| **Enterprise** | $999/month | Unlimited transactions, unlimited users, multi-office, API, white-label | Title insurance underwriters, large agencies |
| **Per-transaction** | $29/filing | Pay-as-you-go option for low-volume shops | Attorneys, occasional closers |

### Revenue Projections (Conservative)

| Milestone | Timeline | MRR | ARR |
|-----------|----------|-----|-----|
| 10 paying customers | Month 2 | $2,990 | $35,880 |
| 50 paying customers | Month 6 | $14,950 | $179,400 |
| 200 paying customers | Month 12 | $59,800 | $717,600 |
| 500 paying customers | Month 18 | $149,500 | $1,794,000 |

### Unit Economics
- CAC target: $500-1,000 (content marketing + direct outreach to title companies)
- LTV target: $6,000-12,000 (24-month average retention at $250-500/mo)
- LTV:CAC ratio: 6-12x
- Gross margin: 85%+ (SaaS, minimal infrastructure costs)
- Payback period: 2-3 months

---

## Go-to-Market Strategy

### Launch (Weeks 1-4)
1. **Build MVP** targeting the exact FinCEN Real Estate Report workflow
2. **Seed with 5-10 title companies** in South Florida (Jon's local network via Palm Realty connections)
3. **Free pilot** for first 10 customers in exchange for feedback and testimonials

### Growth (Months 2-6)
1. **Content SEO** — publish guides: "How to comply with FinCEN real estate rule," "FinCEN filing checklist for title companies," "FinCEN penalties for non-compliance"
2. **ALTA partnership** — American Land Title Association has 6,000+ member companies; sponsor their newsletter, attend conferences
3. **Title insurance underwriter channel** — First American, Fidelity, Old Republic, Stewart collectively have thousands of independent agents who need this
4. **State title association outreach** — present at Florida Land Title Association, Texas, California, New York associations
5. **Integration partnerships** — build connectors for SoftPro, RamQuest, ResWare → appear in their marketplaces

### Competitive Advantages
1. **Purpose-built for FinCEN real estate** — not a general compliance tool bolted onto title software
2. **AI document extraction** — no one else auto-reads operating agreements and pre-fills forms
3. **Affordable** — $199/mo vs enterprise title production suites at $500-2,000/mo
4. **Fast time-to-value** — sign up → first filing in under 30 minutes, no implementation project
5. **Solo founder speed** — can ship features weekly while competitors take quarters

---

## Infrastructure Reuse from AICompliant

| AICompliant Component | TitleComply Equivalent |
|----------------------|----------------------|
| Regulatory scanner (LegiScan, Congress.gov) | FinCEN rule change monitor |
| Compliance task generation | Filing requirement workflow |
| Gap analysis engine | Transaction screening engine |
| Document bundle system | Filing report generation |
| Audit logging (hash chain) | Audit trail (identical) |
| Role-based access control | Team management |
| Stripe billing (tiered plans) | Identical pricing infrastructure |
| SendGrid email system | Reminder/notification emails |
| Clerk auth (multi-tenant) | Identical auth system |
| AES-256-GCM encryption | PII field encryption (identical) |
| Risk scoring | Transaction risk assessment |
| Dashboard + analytics | Compliance dashboard |

**Estimated code reuse: 60-70%** — the core compliance engine, auth, billing, encryption, audit logging, email, and dashboard patterns transfer directly.

---

## Development Timeline

### Week 1: Foundation
- [ ] Register domain (titlecomply.com)
- [ ] Fork AICompliant codebase, strip AI-specific features
- [ ] Adapt Prisma schema for title/escrow models
- [ ] Build transaction screening engine (decision tree)
- [ ] Onboarding flow: company profile → first transaction

### Week 2: Core Workflow
- [ ] Data collection forms (entity, trust, beneficial owner)
- [ ] Document upload + AI extraction (Claude API)
- [ ] Progress tracking per transaction
- [ ] Validation engine (required fields, format checks)

### Week 3: Filing & Compliance
- [ ] FinCEN Real Estate Report generation (PDF)
- [ ] Audit trail with hash chain
- [ ] Dashboard with transaction pipeline
- [ ] Automated reminder emails for missing data
- [ ] Compliance alerts (overdue filings)

### Week 4: Polish & Launch
- [ ] Landing page (SEO-optimized)
- [ ] Stripe billing integration
- [ ] User documentation / help center
- [ ] Security hardening pass
- [ ] Deploy to production
- [ ] Begin outreach to 10 South Florida title companies

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| FinCEN delays electronic filing system | Medium | Support PDF generation first, add e-filing when available |
| Large incumbents add this feature | High (12-18mo) | Move fast, build loyalty, own the niche before they ship |
| Low awareness of the rule | Low (rule is active) | Content marketing explaining penalties drives urgency |
| Title companies resist new software | Medium | Per-transaction pricing removes commitment barrier |
| Regulatory changes to the rule | Low | Regulatory scanner auto-detects changes (reuse from AICompliant) |

---

## Success Metrics

| Metric | Month 3 Target | Month 6 Target | Month 12 Target |
|--------|---------------|---------------|----------------|
| Paying customers | 15 | 50 | 200 |
| MRR | $4,500 | $15,000 | $60,000 |
| Transactions processed | 200 | 1,500 | 10,000 |
| Filing accuracy rate | 99%+ | 99.5%+ | 99.9%+ |
| Avg time to complete filing | < 20 min | < 15 min | < 10 min |
| NPS score | 40+ | 50+ | 60+ |
| Churn rate | < 5% monthly | < 3% monthly | < 2% monthly |

---

## The Pitch (30 seconds)

"Every title company in America is now legally required to file FinCEN reports on cash-to-entity real estate transactions — and most are doing it with spreadsheets. TitleComply automates the entire process: AI reads your operating agreements, pre-fills the forms, validates the data, generates the filing, and keeps a tamper-proof audit trail. It takes 15 minutes instead of 3 hours. We're already built on enterprise-grade compliance infrastructure, and we're priced for the small title shop at $199/month."

---

*Document prepared March 29, 2026*
*Author: Jon (Fed Alcius)*
*Confidential — Do not distribute*
