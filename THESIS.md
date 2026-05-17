# THESIS.md — Complete Technical Documentation for Stag Platform

> **Project:** Stag — Full-stack internship platform connecting Algerian companies with university students
> **Type:** Licence (Bachelor's) Thesis Reference Document
> **Saved:** 2026-04-21
> **Architecture:** Next.js 16 + React 19 + TypeScript + PostgreSQL + Drizzle ORM

---

## Table of Contents

1. [Project Overview & Problem Statement](#1-project-overview--problem-statement)
2. [Technology Stack & Justification](#2-technology-stack--justification)
3. [System Architecture](#3-system-architecture)
4. [Database Design](#4-database-design)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [API Layer (oRPC)](#6-api-layer-orpc)
7. [AI Assistant System](#7-ai-assistant-system)
8. [Matching & Trust Algorithms](#8-matching--trust-algorithms)
9. [Service Layer Architecture](#9-service-layer-architecture)
10. [Frontend Architecture](#10-frontend-architecture)
11. [Internationalization & RTL](#11-internationalization--rtl)
12. [Infrastructure & Deployment](#12-infrastructure--deployment)
13. [Security Considerations](#13-security-considerations)
14. [Testing Strategy](#14-testing-strategy)
15. [Feature Flags & Configuration](#15-feature-flags--configuration)
16. [File Structure](#16-file-structure)

---

## 1. Project Overview & Problem Statement

### 1.1 Context
In Algeria, the process of connecting university students with companies for internships (stages) remains largely manual and fragmented. Students struggle to discover relevant opportunities, companies face difficulties in managing applications, and universities lack digital tools to validate and track placements.

### 1.2 Problem Statement
The existing ecosystem suffers from:
- **Fragmented discovery**: No centralized platform for internship listings
- **Manual workflows**: Paper-based application tracking and validation
- **Lack of transparency**: Students cannot track application status
- **No matching intelligence**: Companies cannot easily find suitable candidates
- **Document authenticity**: No verification system for internship certificates

### 1.3 Solution: Stag
Stag is a full-stack web platform that digitalizes the complete internship lifecycle, connecting students, companies, and universities through a single integrated system.

**User Roles:**
- **Students**: Discover offers, apply with AI cover letters, track applications, view skill gap analysis
- **Company Owners**: Full company administration; manage team members (invite/remove recruiters); post and manage offers; handle candidate pipelines; schedule interviews; use AI recruitment assistant; manage company profile and verification documents
- **Recruiters**: Post and manage internship offers; screen and manage candidate pipelines (accept, refuse, advance stages); communicate with applicants via messaging; schedule and manage interviews; use AI recruitment assistant for offer drafting and candidate summarization; operate under a company with scoped permissions (cannot manage company settings or team members)
- **University Admins**: Validate placements across all departments; manage departments and assign department heads; generate official documents (agreements, certificates); oversee university-wide analytics
- **Department Heads**: Review and validate/reject internship placements exclusively for students within their assigned department; access department-specific dashboard statistics and placement analytics; monitor student application journeys scoped to their department; cannot manage other departments or generate official documents (university admin privileges)
- **Super Admins**: Full platform administration, user management, analytics, system configuration, and trust algorithm oversight

---

## 2. Technology Stack & Justification

### 2.1 Complete Stack

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| **Runtime** | Bun | 1.x | Fast JavaScript runtime, 3x faster than Node.js, built-in bundler |
| **Framework** | Next.js (App Router) | 16.2.1 | Server Components, streaming, file-based routing, optimal for SEO |
| **UI Library** | React | 19.2.4 | Latest React with Server Components and Actions |
| **Language** | TypeScript | 5.x (strict) | Type safety across full stack, eliminates runtime errors |
| **Styling** | Tailwind CSS | 4.x | Utility-first with `@theme inline`, minimal CSS bundle |
| **Components** | shadcn/ui | 3.8.3 | Accessible, customizable primitives on Radix UI |
| **Animation** | motion | 12.33.0 | Successor to Framer Motion, declarative animations |
| **State (Server)** | @tanstack/react-query | 5.90.20 | Caching, synchronization, background refetching |
| **Forms** | @tanstack/react-form | 1.28.0 | Headless, type-safe form management |
| **Validation** | zod | 4.3.6 | Schema validation shared between client and server |
| **ORM** | drizzle-orm | 0.45.1 | Type-safe SQL-like queries, lightweight |
| **Database** | PostgreSQL | 16 | ACID compliance, advanced indexing, JSONB support |
| **Driver** | postgres | 3.4.5 | Fast PostgreSQL driver for Bun |
| **RPC** | @orpc/server + client | 1.13.4 | Type-safe RPC with Zod validation, TanStack Query integration |
| **Auth** | better-auth | 1.4.18 | Modern auth with 2FA, multi-session, role-based access |
| **AI SDK** | ai (Vercel) | 6.0.78 | Unified interface for AI streaming and tool use |
| **LLM Provider** | @ai-sdk/openai | 3.0.26 | OpenAI-compatible API with gateway routing |
| **External Tools** | @arcadeai/arcadejs | 2.2.0 | Tool integration for GitHub, Gmail |
| **Email** | resend + @react-email | 6.9.1 | Transactional email with React templates |
| **PDF** | @react-pdf/renderer | 4.3.2 | React-based PDF generation |
| **i18n** | next-intl | 4.8.2 | Internationalization with RTL support |
| **Theming** | next-themes | 0.4.6 | Dark/light mode with CSS variables |
| **Storage** | AWS S3 SDK | 3.990.0 | S3-compatible object storage |
| **Testing** | Bun test + @testing-library | — | Fast test runner, DOM testing |
| **E2E** | Playwright | 1.58.2 | Cross-browser automated testing |
| **Lint/Format** | Biome | 2.4.2 | Fast unified linter and formatter |
| **Container** | Docker | — | Multi-stage builds, reproducible deployments |
| **Reverse Proxy** | Caddy 2 | — | Auto-HTTPS, reverse proxy |
| **CI/CD** | GitHub Actions | — | Automated testing, building, deployment |
| **Logging** | Pino | 10.x | Structured JSON logging with redaction |

### 2.2 Why This Stack?

**Type Safety End-to-End**: TypeScript -> Zod -> Drizzle -> oRPC ensures type safety from database to UI.

**Performance**: Bun runtime + PostgreSQL + Next.js App Router with Server Components minimizes JavaScript sent to the client.

**Developer Experience**: Hot reload, type-safe API calls via oRPC, Drizzle Kit for migrations.

**Scalability**: Stateless Next.js app, PostgreSQL with proper indexing, Redis for rate limiting, S3 for file storage.

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
                        Internet
                           |
                      Caddy :443
                      (auto-HTTPS)
                           |
                     Next.js App :3000
                      /          \
               App Router      API Routes
              (RSC + CC)     /     |     \
                           Auth   oRPC   Assistant
                           |       |        |
                    Better Auth  172 procs  AI SDK Gateway
                          \       |      /
                       +----------------------+
                       |   Services Layer     |
                       |  (18 domains)        |
                       +----------+-----------+
                                  |
                    +-------------+-------------+
                    |             |             |
               PostgreSQL     Redis         S3/R2
               (Drizzle)    (Rate limit)   (Files)
```

### 3.2 Request Flow Example

**Student applies to an offer:**

1. Client calls `orpc.applications.apply.mutationOptions()` via TanStack Query
2. POST to `/api/rpc/applications.apply`
3. Middleware chain: `authedProcedure` -> `studentProcedureStandard` (100 req/min)
5. Handler calls `applyToOffer()` service (with row-level locking via `FOR UPDATE`)
6. Service creates application record + timeline event atomically
7. Notification created for company members
8. Response returned to client
9. TanStack Query invalidates local cache

---

## 4. Database Design

### 4.1 ORM Configuration

**Drizzle Config** (`drizzle.config.ts`):

```typescript
export default defineConfig({
  out: "./src/server/db/migrations",
  schema: "./src/server/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: requireEnv("DATABASE_URL"),
  },
})
```

**Database Client** (`src/server/db/index.ts`):

```typescript
const client = postgres(env.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 30,
  max_lifetime: 60 * 5,
  prepare: false, // Disabled for connection pooler compatibility
})

export const db = drizzle(client, { schema })
```

### 4.2 Complete Entity-Relationship Model

```
user (1) -------< session (N)
user (1) -------< account (N)
user (1) -------< two_factor (N)
user (1) -------< verification (N)

university (1) --< university_domain (N)
university (1) --< department (N)
university (1) --< user (N) [students]
university (1) --< university_member (N)

department (1) --< department_skill (N:M skill_tag)
department (1) --< student_profile (N) [via departmentId]
department (1) --< university_member (N) [heads]

company (1) -----< company_member (N:M user)
company (1) -----< internship_offer (N)
company (1) -----< assistant_conversation (N)
company (1) -----< company_quality_feedback (N)
company (1) -----< company_report (N)
company (1) -----< interview (N)
company (1) -----< offer_message_thread (N)

internship_offer (1) --< internship_offer_skill (N:M skill_tag)
internship_offer (1) --< internship_offer_language_requirement (N)
internship_offer (1) --< application (N)
internship_offer (1) --< saved_offer (N:M user)
internship_offer (1) --< student_offer_readiness_snapshot (N)
internship_offer (1) --< interview (N)
internship_offer (1) --< offer_message_thread (N)
internship_offer (1) --< offer_message (N)

application (1) --< placement (0..1)
application (1) --< interview (0..1)
application (1) --< application_timeline_event (N)

placement (1) ----< document (N) [agreement, certificate]
placement (1) ----< company_quality_feedback (N)

department (1) --< field (N) [via field_id]
skill_category (1) --< skill_tag (N) [via category_id]
field (1) --< field_skill (N:M skill_tag)
department (1) --< department_category (N:M skill_category)

user (1) -------< student_profile (1)
user (1) -------< student_skill (N:M skill_tag)
user (1) -------< student_language (N)
user (1) -------< student_experience (N)
user (1) -------< student_project (N)
user (1) -------< student_resume (1)
user (1) -------< application (N)
user (1) -------< notification (N)
user (1) -------< notification_preference (1)
user (1) -------< saved_offer (N:M internship_offer)
user (1) -------< company_member (N:M company)
user (1) -------< university_member (0..1)
user (1) -------< company_quality_feedback (N)
user (1) -------< company_report (N) [as reporter]
user (1) -------< offer_message_thread (N)
user (1) -------< offer_message (N)
user (1) -------< offer_message_read_state (N)
user (1) -------< interview (N) [as student]
user (1) -------< interview (N) [as proposer]
user (1) -------< interview (N) [as confirmer]

offer_message_thread (1) --< offer_message (N)
offer_message_thread (1) --< offer_message_read_state (N)

assistant_conversation (1) --< assistant_message (N)
```

### 4.3 Database Enums (18 total)

| Enum | Values |
|------|--------|
| `user_role` | student, company_admin, **dept_head** (deprecated/legacy), university_admin, super_admin |
| `company_status` | pending, approved, rejected, suspended |
| `university_status` | pending, approved, rejected |
| `university_domain_status` | pending, approved, rejected, disabled |
| `company_member_role` | owner, recruiter |
| `university_member_role` | department_head |
| `offer_status` | draft, published, closed |
| `work_mode` | on_site, hybrid, remote |
| `internship_type` | pfe, immersion, summer, practical |
| `application_status` | applied, company_accepted, company_refused, admin_validated, admin_rejected, withdrawn |
| `application_pipeline_stage` | applied, screening, interview, offer, accepted, validated, rejected |
| `document_type` | agreement, certificate |
| `document_status` | pending, generated, failed |
| `proficiency_level` | a1, a2, b1, b2, c1, c2, native |
| `company_report_status` | open, reviewing, resolved, dismissed |
| `company_report_severity` | low, medium, high, critical |
| `assistant_message_role` | system, user, assistant |
| `interview_status` | pending_confirmation, confirmed, cancelled, completed |

### 4.4 Complete Table Schema

> **Note on timestamps**: Unless explicitly noted otherwise, nearly every table includes `created_at` (timestamp, DEFAULT NOW(), NOT NULL) and `updated_at` (timestamp, DEFAULT NOW(), $onUpdate(), NOT NULL) columns as standard audit fields. These are omitted from some tables below for brevity but exist in the actual schema.

#### 4.4.1 Authentication Tables

**`user`** — Core user entity

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | UUID primary key |
| email | text | NOT NULL, UNIQUE | User email address |
| email_verified | boolean | DEFAULT false, NOT NULL | Email verification status |
| role | user_role | DEFAULT 'student', NOT NULL | User role |
| university_id | text | FK -> university.id, ON DELETE SET NULL | Associated university |
| department_id | text | FK -> department.id, ON DELETE SET NULL | Associated department |
| onboarding_completed | boolean | DEFAULT false, NOT NULL | Onboarding completion |
| name | text | | Display name |
| image | text | | Avatar URL |
| two_factor_enabled | boolean | DEFAULT false | 2FA enabled flag |
| banned | boolean | DEFAULT false | Account banned |
| ban_reason | text | | Ban reason text |
| ban_expires | timestamp | | Temporary ban expiry |
| created_at | timestamp | DEFAULT NOW(), NOT NULL | Creation timestamp |
| updated_at | timestamp | DEFAULT NOW(), $onUpdate(), NOT NULL | Auto-updated timestamp |

**Indexes**: `user_universityId_idx`, `user_role_universityId_idx`, `user_departmentId_idx`

**`session`** — Active sessions (Better Auth)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | Session ID |
| expires_at | timestamp | NOT NULL | Session expiry |
| token | text | NOT NULL, UNIQUE | Session token |
| created_at | timestamp | DEFAULT NOW(), NOT NULL | |
| updated_at | timestamp | NOT NULL | |
| ip_address | text | | Client IP |
| user_agent | text | | Client UA |
| user_id | text | FK -> user.id, ON DELETE CASCADE | |
| impersonated_by | text | | Admin impersonation source |

**`account`** — OAuth/SSO accounts (Better Auth)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | |
| account_id | text | NOT NULL | Provider account ID |
| provider_id | text | NOT NULL | Provider name |
| user_id | text | FK -> user.id, ON DELETE CASCADE | |
| access_token | text | | OAuth access token |
| refresh_token | text | | OAuth refresh token |
| id_token | text | | OpenID token |
| access_token_expires_at | timestamp | | Token expiry |
| refresh_token_expires_at | timestamp | | Refresh expiry |
| scope | text | | Granted scopes |
| password | text | | Hashed password |
| created_at | timestamp | DEFAULT NOW(), NOT NULL | |
| updated_at | timestamp | $onUpdate(), NOT NULL | |

**`verification`** — Email verification codes (Better Auth)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | |
| identifier | text | NOT NULL | Verification identifier |
| value | text | NOT NULL | Verification code/token |
| expires_at | timestamp | NOT NULL | Expiry timestamp |
| created_at | timestamp | DEFAULT NOW(), NOT NULL | |
| updated_at | timestamp | DEFAULT NOW(), $onUpdate(), NOT NULL | |

**`two_factor`** — TOTP secrets and backup codes (Better Auth)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | |
| secret | text | NOT NULL | TOTP secret |
| backup_codes | text | NOT NULL | Encrypted backup codes |
| user_id | text | FK -> user.id, ON DELETE CASCADE | |
| created_at | timestamp | DEFAULT NOW(), NOT NULL | |
| updated_at | timestamp | DEFAULT NOW(), $onUpdate(), NOT NULL | |

#### 4.4.2 Academic Tables

**`university`** — University entity

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | |
| name | text | NOT NULL, UNIQUE | University name |
| abbreviation | text | | Short name |
| address | text | | Physical address |
| city | text | | City |
| wilaya_code | integer | | Algerian province code (1-58) |
| phone | text | | Contact phone |
| logo_url | text | | Logo image URL |
| department_name | text | | Default department label |
| status | university_status | DEFAULT 'approved', NOT NULL | Approval status |
| approved_at | timestamp | | Approval timestamp |
| approved_by_user_id | text | FK -> user.id | Approver reference |
| rejection_reason | text | | Rejection explanation |

**`university_domain`** — Approved email domains per university

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | |
| university_id | text | FK -> university.id, ON DELETE CASCADE | |
| domain | text | NOT NULL, UNIQUE | Email domain |
| status | university_domain_status | DEFAULT 'approved', NOT NULL | |

**`department`** — University departments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | |
| university_id | text | FK -> university.id, ON DELETE CASCADE | |
| name | text | NOT NULL | Department name |
| field_id | text | FK -> field.id, ON DELETE SET NULL | Field of study |

**Unique**: `department_name_university_uidx` (name + university_id)

**`department_skill`** — Department-specific skill mappings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| department_id | text | FK -> department.id, ON DELETE CASCADE, PK | |
| skill_tag_id | text | FK -> skill_tag.id, ON DELETE CASCADE, PK | |
| action | text | NOT NULL, DEFAULT 'add' | Sync action |
| created_by_user_id | text | FK -> user.id, ON DELETE CASCADE | Actor |
| created_at | timestamp | DEFAULT NOW() | |

**`university_member`** — Department head assignments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | text | FK -> user.id, ON DELETE CASCADE, PK | |
| university_id | text | FK -> university.id, ON DELETE CASCADE | |
| role | university_member_role | NOT NULL | department_head |
| department_id | text | FK -> department.id, ON DELETE SET NULL | |

#### 4.4.3 Corporate Tables

**`company`** — Company entity

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | |
| name | text | NOT NULL | Company name |
| slug | text | NOT NULL, UNIQUE | URL-friendly identifier |
| description | text | | Company description |
| logo_url | text | | Logo image URL |
| website_url | text | | Company website |
| phone | text | | Contact phone |
| contact_email | text | | Public contact email |
| representative_name | text | | Company representative |
| wilaya_code | integer | | Location province |
| address | text | | Physical address |
| verification_document_key | text | | S3 key for verification doc |
| verification_document_name | text | | Original filename |
| verification_document_mime_type | text | | File MIME type |
| verification_document_size_bytes | integer | | File size |
| verification_document_uploaded_at | timestamp | | Upload timestamp |
| status | company_status | DEFAULT 'pending', NOT NULL | Approval status |
| approved_at | timestamp | | Approval timestamp |
| approved_by_user_id | text | FK -> user.id | Approver |
| rejection_reason | text | | Rejection explanation |

**`company_member`** — Company membership

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| company_id | text | FK -> company.id, ON DELETE CASCADE, PK | |
| user_id | text | FK -> user.id, ON DELETE CASCADE, PK | |
| role | company_member_role | DEFAULT 'recruiter', NOT NULL | owner/recruiter |
| created_at | timestamp | DEFAULT NOW() | |

**Unique**: `company_member_userId_uidx` (user_id) — one company per user

#### 4.4.4 Student Profile Tables

**`student_profile`** — Extended student information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | text | FK -> user.id, ON DELETE CASCADE, PK | |
| wilaya_code | integer | | Student location |
| bio | text | | Personal biography |
| phone | text | | Contact phone |
| github_url | text | | GitHub profile |
| portfolio_url | text | | Portfolio website |
| student_number | text | | University student ID |
| department | text | | Deprecated — use department_id |
| department_id | text | FK -> department.id | Formal department |
| level | text | | Academic level (L3, M1, etc) |
| address | text | | Physical address |

**`student_skill`** — Student skill tags

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | text | FK -> user.id, ON DELETE CASCADE, PK | |
| skill_tag_id | text | FK -> skill_tag.id, ON DELETE CASCADE, PK | |
| created_at | timestamp | DEFAULT NOW() | |

**`student_language`** — Student language proficiencies

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | text | FK -> user.id, ON DELETE CASCADE, PK | |
| language_code | text | NOT NULL, PK | ISO language code |
| proficiency | proficiency_level | NOT NULL | a1-c2, native |
| created_at | timestamp | DEFAULT NOW() | |

**`student_experience`** — Work/experience entries

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | |
| user_id | text | FK -> user.id, ON DELETE CASCADE | |
| title | text | NOT NULL | Job/role title |
| organization | text | NOT NULL | Company/organization |
| description | text | | Experience details |
| start_date | timestamp | NOT NULL | Start date |
| end_date | timestamp | | End date |
| is_current | boolean | DEFAULT false, NOT NULL | Currently active |

**`student_project`** — Portfolio projects

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | |
| user_id | text | FK -> user.id, ON DELETE CASCADE | |
| name | text | NOT NULL | Project name |
| summary | text | NOT NULL | Project description |
| project_url | text | | Live/demo URL |
| repository_url | text | | Source code URL |
| start_date | timestamp | | |
| end_date | timestamp | | |

**`student_resume`** — Resume/CV file

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | text | FK -> user.id, ON DELETE CASCADE, PK | |
| file_key | text | NOT NULL | S3 storage key |
| file_name | text | NOT NULL | Original filename |
| file_url | text | NOT NULL | Public URL |
| file_size_bytes | integer | NOT NULL | File size |
| mime_type | text | NOT NULL | File type |
| uploaded_at | timestamp | DEFAULT NOW(), NOT NULL | |

#### 4.4.5 Internship Tables

**`internship_offer`** — Internship opportunity

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | |
| company_id | text | FK -> company.id, ON DELETE CASCADE | |
| title | text | NOT NULL | Offer title |
| description | text | NOT NULL | Full description |
| internship_type | internship_type | NOT NULL | pfe/immersion/summer/practical |
| work_mode | work_mode | | on_site/hybrid/remote |
| wilaya_code | integer | | Location |
| duration_weeks | integer | | Estimated duration |
| max_positions | integer | DEFAULT 1, NOT NULL | Number of openings |
| status | offer_status | DEFAULT 'draft', NOT NULL | draft/published/closed |
| published_at | timestamp | | Publication date |
| application_deadline_at | timestamp | | Application deadline |
| expected_start_date | timestamp | | Expected start |
| expected_end_date | timestamp | | Expected end |
| closes_at | timestamp | | Automatic close date |

**`internship_offer_skill`** — Required skills for an offer

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| offer_id | text | FK -> internship_offer.id, ON DELETE CASCADE, PK | |
| skill_tag_id | text | FK -> skill_tag.id, ON DELETE CASCADE, PK | |
| created_at | timestamp | DEFAULT NOW() | |

**`internship_offer_language_requirement`** — Language requirements

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| offer_id | text | FK -> internship_offer.id, ON DELETE CASCADE, PK | |
| language_code | text | NOT NULL, PK | ISO code |
| minimum_proficiency | proficiency_level | NOT NULL | Minimum required level |
| is_required | boolean | DEFAULT true, NOT NULL | Mandatory or preferred |
| weight | integer | DEFAULT 1, NOT NULL | Scoring weight |

**`saved_offer`** — Bookmarked offers by students

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | text | FK -> user.id, ON DELETE CASCADE, PK | |
| offer_id | text | FK -> internship_offer.id, ON DELETE CASCADE, PK | |
| created_at | timestamp | DEFAULT NOW() | |

#### 4.4.6 Application Tables

**`application`** — Student application to an offer

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | |
| offer_id | text | FK -> internship_offer.id, ON DELETE CASCADE | |
| student_user_id | text | FK -> user.id, ON DELETE CASCADE | |
| status | application_status | DEFAULT 'applied', NOT NULL | Current status |
| pipeline_stage | application_pipeline_stage | DEFAULT 'applied', NOT NULL | Pipeline position |
| cover_letter | text | | Application cover letter |
| company_action_by_user_id | text | FK -> user.id | Company actor |
| company_action_at | timestamp | | Company action timestamp |
| company_note | text | | Company internal note |
| admin_action_by_user_id | text | FK -> user.id | Admin actor |
| admin_action_at | timestamp | | Admin action timestamp |
| admin_note | text | | Admin internal note |
| created_at | timestamp | DEFAULT NOW() | |
| pipeline_stage_updated_at | timestamp | DEFAULT NOW() | Stage change timestamp |
| updated_at | timestamp | DEFAULT NOW(), $onUpdate() | |

**Unique**: `application_offer_student_uidx` (offer_id + student_user_id)

**`application_timeline_event`** — Audit log for application state changes

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | |
| application_id | text | FK -> application.id, ON DELETE CASCADE | |
| actor_user_id | text | FK -> user.id | Who made the change |
| event_type | text | NOT NULL | Event category |
| from_stage | application_pipeline_stage | | Previous stage |
| to_stage | application_pipeline_stage | | New stage |
| from_status | application_status | | Previous status |
| to_status | application_status | | New status |
| payload | jsonb | DEFAULT {}, NOT NULL | Additional event data |
| created_at | timestamp | DEFAULT NOW() | |

#### 4.4.7 Placement Tables

**`placement`** — Validated internship placement

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | |
| application_id | text | FK -> application.id, ON DELETE CASCADE | |
| validated_by_user_id | text | FK -> user.id | Validating admin |
| validated_at | timestamp | DEFAULT NOW(), NOT NULL | Validation timestamp |
| start_date | timestamp | NOT NULL | Internship start |
| end_date | timestamp | NOT NULL | Internship end |

**Unique**: `placement_applicationId_uidx` (application_id)

**`document`** — Generated PDF documents

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | |
| placement_id | text | FK -> placement.id, ON DELETE CASCADE | |
| type | document_type | NOT NULL | agreement/certificate |
| status | document_status | DEFAULT 'pending', NOT NULL | pending/generated/failed |
| storage_key | text | | S3 key for PDF |
| url | text | | Public URL |
| verification_code | text | | Unique verification code |
| snapshot_data | jsonb | | Immutable document data snapshot |
| meta | jsonb | | Additional metadata |
| locale | text | DEFAULT 'en', NOT NULL | Document locale |
| border_style | text | DEFAULT 'classic', NOT NULL | Visual style |
| created_at | timestamp | DEFAULT NOW() | |

**Unique**: `document_placement_variant_uidx` (placement_id + type + locale + border_style), `document_verification_code_uidx` (verification_code)

#### 4.4.8 Interview Tables

**`interview`** — Interview scheduling

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | |
| application_id | text | FK -> application.id, ON DELETE CASCADE | |
| offer_id | text | FK -> internship_offer.id, ON DELETE CASCADE | |
| company_id | text | FK -> company.id, ON DELETE CASCADE | |
| student_user_id | text | FK -> user.id, ON DELETE CASCADE | |
| proposed_by_user_id | text | FK -> user.id | Company member who proposed |
| confirmed_by_user_id | text | FK -> user.id | Student who confirmed |
| confirmed_slot_id | text | FK -> interview_slot.id | Selected time slot |
| status | interview_status | DEFAULT 'pending_confirmation', NOT NULL | |
| note | text | | Interview notes |
| confirmed_at | timestamp | | Confirmation timestamp |

**`interview_slot`** — Proposed time slots

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | |
| interview_id | text | FK -> interview.id, ON DELETE CASCADE | |
| starts_at | timestamp | NOT NULL | Slot start |
| ends_at | timestamp | NOT NULL | Slot end |
| location | text | | Physical location |
| meeting_url | text | | Online meeting link |

#### 4.4.9 Messaging Tables

**`offer_message_thread`** — Conversation thread between student and company

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | |
| offer_id | text | FK -> internship_offer.id, ON DELETE CASCADE | |
| company_id | text | FK -> company.id, ON DELETE CASCADE | |
| student_user_id | text | FK -> user.id, ON DELETE CASCADE | |
| created_by_user_id | text | FK -> user.id | Thread creator |
| last_message_at | timestamp | DEFAULT NOW(), NOT NULL | Activity timestamp |

**`offer_message`** — Individual messages

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | |
| thread_id | text | FK -> offer_message_thread.id, ON DELETE CASCADE | |
| offer_id | text | FK -> internship_offer.id, ON DELETE CASCADE | |
| sender_user_id | text | FK -> user.id, ON DELETE CASCADE | |
| body | text | NOT NULL | Message content |
| created_at | timestamp | DEFAULT NOW() | |

**`offer_message_read_state`** — Per-user read tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| thread_id | text | FK -> offer_message_thread.id, ON DELETE CASCADE | |
| user_id | text | FK -> user.id, ON DELETE CASCADE | |
| last_read_message_id | text | FK -> offer_message.id | Last read message |
| last_read_at | timestamp | | Read timestamp |

**Unique**: `offer_message_read_state_thread_user_uidx` (thread_id + user_id)

#### 4.4.10 Notification Tables

**`notification`** — User notifications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | |
| user_id | text | FK -> user.id, ON DELETE CASCADE | |
| type | text | NOT NULL | Notification type |
| payload | jsonb | DEFAULT {}, NOT NULL | Type-specific data |
| read_at | timestamp | | Read timestamp (null = unread) |
| created_at | timestamp | DEFAULT NOW() | |

**`notification_preference`** — Per-user notification settings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | text | FK -> user.id, ON DELETE CASCADE, PK | |
| in_app_enabled | boolean | DEFAULT true, NOT NULL | |
| email_enabled | boolean | DEFAULT true, NOT NULL | |

#### 4.4.11 AI Assistant Tables

**`assistant_conversation`** — Company AI chat sessions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | |
| company_id | text | FK -> company.id, ON DELETE CASCADE | |
| created_by_user_id | text | FK -> user.id, ON DELETE CASCADE | |
| title | text | | Auto-generated title |
| model | text | NOT NULL | AI model used |

**`assistant_message`** — AI conversation messages

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | |
| conversation_id | text | FK -> assistant_conversation.id, ON DELETE CASCADE | |
| role | assistant_message_role | NOT NULL | system/user/assistant |
| text | text | | Plain text for quick rendering |
| parts | jsonb | NOT NULL | Full UI message parts |
| created_at | timestamp | DEFAULT NOW() | |

#### 4.4.12 Trust & Analytics Tables

**`company_quality_feedback`** — Student feedback on company experience

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | |
| placement_id | text | FK -> placement.id, ON DELETE CASCADE | |
| company_id | text | FK -> company.id, ON DELETE CASCADE | |
| student_user_id | text | FK -> user.id, ON DELETE CASCADE | |
| rating | integer | NOT NULL | 1-5 star rating |
| would_recommend | boolean | DEFAULT false, NOT NULL | |
| comment | text | | Free text feedback |
| created_at | timestamp | DEFAULT NOW() | |

**`company_report`** — Student reports on company misconduct

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | |
| company_id | text | FK -> company.id, ON DELETE CASCADE | |
| reporter_user_id | text | FK -> user.id, ON DELETE CASCADE | |
| category | text | NOT NULL | Report category |
| severity | company_report_severity | DEFAULT 'medium', NOT NULL | |
| description | text | NOT NULL | Report details |
| status | company_report_status | DEFAULT 'open', NOT NULL | |
| resolution_note | text | | Admin resolution note |
| resolved_by_user_id | text | FK -> user.id | Admin resolver |
| resolved_at | timestamp | | Resolution timestamp |
| meta | jsonb | DEFAULT {}, NOT NULL | Additional data |
| created_at | timestamp | DEFAULT NOW() | |

**`student_offer_readiness_snapshot`** — Match score history

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | |
| student_user_id | text | FK -> user.id, ON DELETE CASCADE | |
| offer_id | text | FK -> internship_offer.id, ON DELETE CASCADE | |
| ready_percent | integer | NOT NULL | Match percentage |
| missing_skills_count | integer | NOT NULL | Number of missing skills |
| source | text | DEFAULT 'offer_view', NOT NULL | Snapshot trigger |
| meta | jsonb | DEFAULT {}, NOT NULL | Full score breakdown |
| captured_at | timestamp | DEFAULT NOW(), NOT NULL | |

#### 4.4.13 Infrastructure Tables

**`rate_limit_bucket`** — Fallback rate limiting (when Redis unavailable)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| bucket_key | text | NOT NULL, PK | Rate limit key |
| window_ms | integer | NOT NULL, PK | Window duration |
| window_start | timestamp | NOT NULL, PK | Window start |
| count | integer | DEFAULT 0, NOT NULL | Request count |
| updated_at | timestamp | DEFAULT NOW(), NOT NULL | |

**`skill_tag`** — Global skill taxonomy

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | |
| name | text | NOT NULL | Display name |
| slug | text | NOT NULL, UNIQUE | URL-friendly identifier |
| category_id | integer | NOT NULL, FK -> skill_category.id | Skill category |
| description | text | | Description |
| status | text | DEFAULT 'active', NOT NULL | active/deprecated |
| created_by | text | | Creator reference |

**`skill_category`** — Skill category taxonomy

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | integer | PK | |
| name | text | NOT NULL | Display name |
| slug | text | NOT NULL, UNIQUE | URL-friendly identifier |
| description | text | | Description |
| icon | text | | Icon identifier |
| status | text | DEFAULT 'active', NOT NULL | active/deprecated |
| created_at | timestamp | DEFAULT NOW(), NOT NULL | |
| updated_at | timestamp | DEFAULT NOW(), NOT NULL | |

**`field`** — Field of study taxonomy

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | |
| name | text | NOT NULL | Display name |
| slug | text | NOT NULL, UNIQUE | URL-friendly identifier |
| description | text | | Description |
| created_at | timestamp | DEFAULT NOW(), NOT NULL | |
| updated_at | timestamp | DEFAULT NOW(), NOT NULL | |

**`field_skill`** — Field-to-skill mappings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| field_id | text | FK -> field.id, ON DELETE CASCADE, PK | |
| skill_tag_id | text | FK -> skill_tag.id, ON DELETE CASCADE, PK | |
| created_at | timestamp | DEFAULT NOW() | |

**`department_category`** — Department-to-skill-category mappings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| department_id | text | FK -> department.id, ON DELETE CASCADE, PK | |
| skill_category_id | integer | FK -> skill_category.id, ON DELETE CASCADE, PK | |
| created_at | timestamp | DEFAULT NOW() | |

**`site_settings`** — Platform configuration singleton

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | integer | PK | Singleton row |
| maintenance_mode | boolean | DEFAULT false | Maintenance toggle |
| updated_at | timestamp | DEFAULT NOW(), NOT NULL | |

### 4.5 Indexing Strategy

The schema uses strategic indexes for performance:
- **Foreign key indexes**: Every foreign key has a dedicated index for JOIN performance
- **Composite indexes**: Frequently queried combinations (offer_id + status, user_id + created_at)
- **Unique indexes**: Prevent duplicates (applications per student per offer, department names per university)
- **Search indexes**: name, slug, status columns for listing/filtering queries

---

## 5. Authentication & Authorization

### 5.1 Auth Framework: Better Auth

Better Auth is configured with multiple plugins for comprehensive authentication:

**Core Configuration:**
- Database adapter: Drizzle ORM with PostgreSQL
- Session expiry: 30 days
- Token refresh: Daily
- Cookie cache: 5 minutes (reduces DB hits)
- Rate limiting: Enabled in production

**Plugins:**
1. **Admin Plugin** — Access control matrix, impersonation (8-hour sessions)
2. **Two-Factor** — TOTP + email OTP + 10 backup codes (5-minute OTP validity)
3. **Multi-Session** — Max 5 concurrent sessions per user
4. **Captcha** — Cloudflare Turnstile (optional, dev bypass)
5. **NextCookies** — Server Action cookie handling (must be last)

**Additional User Fields:**
- role (student, company_admin, dept_head, university_admin, super_admin)
- university_id, department_id
- onboarding_completed
- banned, ban_reason, ban_expires
- two_factor_enabled

### 5.2 University Email Domain Validation

Students must sign up with an approved university email domain:

```
student@cs.univ-constantine2.dz
    |
    v
Extract domain: "cs.univ-constantine2.dz"
    |
    v
Generate candidates: ["cs.univ-constantine2.dz", "univ-constantine2.dz"]
    |
    v
Query university_domain WHERE status='approved' AND domain IN (candidates)
    |
    v
Auto-assign universityId on match, reject if no match
```

Company admins and university admins can sign up with any email (verified during onboarding).

### 5.3 Role System & Department Heads

**5 roles exist:**

| Role | Database Value | Description |
|------|---------------|-------------|
| Student | `student` | Default role, discovers and applies |
| Company Admin | `company_admin` | Manages company offers and candidates |
| University Admin | `university_admin` | Validates placements, manages departments |
| Department Head | `university_admin` + `university_member.role='department_head'` | Scoped validation for own department |
| Super Admin | `super_admin` | Full platform control |

Department heads are represented via the `university_member` bridge table linking a user to a specific department with role `department_head`.

### 5.4 Session Security

- Session expiry: 30 days with daily refresh
- Max concurrent sessions: 5
- Password policy: 8-128 characters
- 2FA: TOTP + email OTP + backup codes
- Impersonation: 8-hour sessions with full audit trail
- Banning: Temporary (with expiry) and permanent with reason

---

## 6. API Layer (oRPC)

### 6.1 Why oRPC?

oRPC provides type-safe client-server communication:
- **Zod validation**: Input/output schemas validated at runtime
- **TanStack Query integration**: `useQuery(orpc.companies.list.queryOptions())`
- **Middleware pipeline**: Composable auth, rate limiting, logging

### 6.2 Middleware Chain

```
publicProcedure                          — No auth required
└── authedSessionProcedure               — Valid session (bypasses approval gate)
    └── authedProcedure                  — Valid session + approval gate
        ├── adminProcedure               — university_admin or super_admin
        │   └── [rate-limited variants]
        ├── superAdminProcedure          — super_admin only
        │   └── [rate-limited variants]
        ├── universityProcedure          — university_admin + dept heads
        │   └── [rate-limited variants]
        │   └── deptHeadProcedure        — universityProcedure + dept_head membership
        │       └── [rate-limited variants]
        ├── companyAdminProcedure        — company_admin + injects membership
        │   ├── companyOwnerProcedure    — company_admin + owner role
        │   └── [rate-limited variants]
        ├── studentProcedure             — student + injects profile
        │   └── [rate-limited variants]
        └── [rate-limited variants]
```

### 6.3 Rate-Limited Procedure Variants (25 total)

| Procedure | Limit | Use Case |
|-----------|-------|----------|
| `publicProcedureStrict` | 5/min | Auth endpoints |
| `publicProcedureStandard` | 100/min | Public reads |
| `authedProcedureStandard` | 100/min | General API |
| `authedProcedureGenerous` | 300/min | Listings/search |
| `authedProcedureStrict` | 5/min | Sensitive ops |
| `authedProcedureAssistant` | 20/min | AI calls |
| `authedSessionProcedureStandard` | 100/min | Session bootstrap |
| `authedSessionProcedureGenerous` | 300/min | Session reads |
| `adminProcedureStandard` | 100/min | Admin operations |
| `adminProcedureGenerous` | 300/min | Bulk admin reads |
| `adminProcedureAssistant` | 20/min | Admin AI calls |
| `universityProcedureStandard` | 100/min | University ops |
| `universityProcedureAssistant` | 20/min | University AI |
| `superAdminProcedureStandard` | 100/min | Super admin ops |
| `superAdminProcedureGenerous` | 300/min | Bulk super admin |
| `companyAdminProcedureStandard` | 100/min | Company ops |
| `companyAdminProcedureGenerous` | 300/min | Company reads |
| `companyAdminProcedureAssistant` | 20/min | Company AI |
| `companyOwnerProcedureStandard` | 100/min | Owner ops |
| `companyOwnerProcedureGenerous` | 300/min | Owner reads |
| `studentProcedureStandard` | 100/min | Student mutations |
| `studentProcedureGenerous` | 300/min | Student reads |
| `deptHeadProcedureStandard` | 100/min | Dept head ops |
| `deptHeadProcedureGenerous` | 300/min | Dept head reads |
| `assistantProcedureLimited` | 20/min | AI assistant |

### 6.4 Complete API Surface (172 Procedures across 21 namespaces)

**`users`** (7): getMe, updateMe, uploadAvatar, deleteAvatar, listMySessions, revokeMySession, revokeOtherSessions

**`companies`** (22): list, getById, create, update, delete, deleteOwn, listMembers, inviteMember, removeMember, downloadVerificationDocument, uploadLogo, listPublicDirectory, approve, reject, suspend, reactivate, getTrustIndex, listTrustIndices, submitQualityFeedback, submitReport, listReports, resolveReport

**`fields`** (7): list, get, create, update, delete, syncSkills, getSkills

**`skills`** (4): list, listPrioritized, create, listCategories

**`students`** (6): getProfile, getPublicProfile, upsertProfile, upsertProfileDetails, upsertSkills, upsertLanguages

**`offers`** (15): getById, listByCompany, create, update, delete, updateStatus, search, parseSearchQuery, listSaved, checkSaved, save, unsave, generateDraft, improveDescription, suggestSkills

**`applications`** (11): checkApplication, apply, listByStudent, withdraw, listByOffer, companyAccept, companyRefuse, updatePipelineStage, getTimeline, generateCoverLetter, listJourneys

**`matching`** (4): getScore, getSkillGap, getReadinessHistory, captureReadinessSnapshot

**`placements`** (5): listPending, getPendingById, validate, reject, generateValidationSummary

**`deptHead`** (5): listPending, getPendingById, validate, reject, getDashboardStats

**`departments`** (11): list, create, update, delete, assignHead, unassignHead, bulkCreateWithHeads, syncSkills, getSkills, assignCategories, listCategories

**`documents`** (10): generateAgreement, generateCertificateByCompany, listByStudent, listByCompany, download, downloadByCompany, verify, generateCertificate, revokeCertificate, generateMissingCertificates

**`notifications`** (5): list, markRead, markAllRead, getPreferences, updatePreferences

**`interviews`** (7): listForCompany, listForStudent, proposeSlots, confirmSlot, complete, cancel, getById

**`messages`** (8): listByCompany, listByStudent, listStartersByCompany, listStartersByStudent, listThreadMessages, sendByCompany, sendByStudent, markThreadRead

**`studentCv`** (9): get, createExperience, updateExperience, deleteExperience, createProject, updateProject, deleteProject, uploadResume, deleteResume

**`stats`** (2): getAdminStats, getUniversityDashboardStats

**`adminUsers`** (11): list, create, setRole, ban, unban, remove, setPassword, update, listSessions, revokeSession, revokeAllSessions

**`universities`** (12): list, getById, create, update, delete, approve, reject, updateMyUniversity, listMyDomains, addDomain, removeDomain, uploadLogo

**`assistant`** (9): listModels, listConversations, createConversation, deleteConversation, getConversation, listMessages, updateConversationModel, updateConversationTitle, appendMessage

**`adminSettings`** (2): getMaintenanceMode, setMaintenanceMode

### 6.5 Client Usage Patterns

**Direct call (forms):**
```typescript
import { orpcClient } from "@/server/orpc/client"
const me = await orpcClient.users.getMe()
```

**TanStack Query:**
```typescript
import { orpc } from "@/server/orpc/client"
const { data } = useQuery(
  orpc.companies.list.queryOptions({ input: { status: "approved" } })
)
```

**Mutation with invalidation:**
```typescript
const { mutateAsync } = useMutation(
  orpc.companies.create.mutationOptions({
    onSuccess: () => queryClient.invalidateQueries({
      queryKey: orpc.companies.list.queryOptions().queryKey
    }),
  })
)
```

---

## 7. AI Assistant System

### 7.1 Architecture Overview

```
Client (useCopilot hook)
    |
    v
POST /api/assistant/chat
    |
    v
Chat Handler
    ├── Auth + Rate Limit (20 req/min)
    ├── Intent Detection
    ├── RBAC Check
    ├── Context Minimization (PII redaction)
    ├── System Prompt (persona-based)
    ├── Tool Resolution
    │   ├── Internal Tools (9) — structured output via AI SDK
    │   └── Arcade Tools — external services (GitHub, Gmail)
    └── AI Model Router (streaming via Vercel AI SDK)
    |
    v
Persistence (assistant_conversation + assistant_message)
```

### 7.2 AI Provider Configuration

The system uses a single OpenAI-compatible provider:

**Environment:**
```
AI_API_KEY=sk-... (primary)
AI_MODEL=openai/gpt-4o
AI_ALLOWED_MODELS=openai/gpt-4o,openai/gpt-4o-mini
AI_BASE_URL=https://ai-gateway.vercel.sh/v1
```

**Resolution:**
- A single OpenAI-compatible client is created using `AI_API_KEY` + `AI_BASE_URL`
- Poe endpoints are auto-detected via URL pattern for SSE compatibility patching only

### 7.3 Personas

| Persona | Triggered By | Context |
|---------|-------------|---------|
| Stag Company Copilot | company_admin role | Full conversational chat; recruitment, offer drafting, candidate summaries |
| Stag Student Copilot | student role | Intent-specific one-off calls only (search parsing, cover letter drafting); no persistent conversation CRUD |
| Stag Admin Copilot | admin/super_admin | Intent-specific one-off calls only (validation summaries); no persistent conversation CRUD |

### 7.4 Internal Tools (9)

All tools use `generateText` with structured output (Zod schemas):

| Tool | Role | Output |
|------|------|--------|
| `offer_generate_draft` | company_admin | `{title, description, internshipType, workMode, wilayaCode, durationWeeks, maxPositions, suggestedSkillTagIds, suggestedSkillTagNames}` |
| `offer_improve_description` | company_admin | `{description}` |
| `offer_suggest_skill_tags` | company_admin | `{skillTagIds, skillTagNames}` |
| `candidate_summarize` | company_admin | `{summary, strengths[], concerns[], followUps[]}` |
| `candidate_draft_refusal_note` | company_admin | `{note}` |
| `admin_validation_summary` | admin | `{summaryBullets[], checklist[], potentialInconsistencies[]}` |
| `student_search_parse` | student | `{keyword, wilayaCode, internshipTypes[], workModes[], skillTagIds[], explanation}` |
| `student_cover_letter_draft` | student | `{coverLetter}` |
| `notifications_summarize` | all | `{summaryBullets[], suggestedNextActions[]}` |

### 7.5 External Tools (Arcade)

- **Providers**: GitHub (repositories, issues), Gmail (send/search emails)
- **Cache**: 5-minute TTL, LRU (max 100 entries)
- **Retry**: 2 attempts with exponential backoff
- **Activation**: Only for company_admin when FEATURE_COMPANY_ASSISTANT=true

---

## 8. Matching & Trust Algorithms

### 8.1 Match Scoring Algorithm v1.0.0

**Weights:**

| Factor | Weight | Source |
|--------|--------|--------|
| Skills | 55% | Student skills vs. offer required skills |
| Language | 20% | CEFR proficiency levels (A1-C2, native) |
| Location | 15% | Wilaya match + work mode |
| Profile | 10% | Completeness signals (bio, phone, GitHub, portfolio, dept, level, 3+ skills) |

**Skills Scoring:**
```
if offerSkills.length === 0:
  skillsScore = 55
else:
  skillsScore = round((matchedSkills / offerSkills) * 55)
```

**Language Scoring:**
```
PROFICIENCY_RANK = { a1:1, a2:2, b1:3, b2:4, c1:5, c2:6, native:7 }

For each requirement:
  met = PROFICIENCY_RANK[student] >= PROFICIENCY_RANK[required]
  weighted sum

baseScore = (metWeight / totalWeight) * 20
if required languages missed:
  penalty = (missedRatio) * (20 * 0.5)
  languageScore = max(0, baseScore - penalty)
```

**Location Scoring:**
```
if workMode === "remote": locationScore = 15
else if missing location data: locationScore = round(15 * 0.45)
else if different wilaya:
  locationScore = workMode === "hybrid" ? round(15 * 0.55) : round(15 * 0.25)
else: locationScore = 15
```

**Profile Scoring:**
```
signals = [bio, phone, github, portfolio, department, level, skills>=3]
profileRatio = trueCount / 7
profileScore = round(profileRatio * 10)
```

**Final Score:**
```
total = clamp(skillsScore + languageScore + locationScore + profileScore, 0, 100)
```

### 8.2 Trust Index (Company Scoring)

**Formula:**
```
trustScore = clamp(
  responseRate * 0.3 +
  completionRate * 0.3 +
  feedbackScore * 0.3 -
  min(40, reportPenalty) +
  10
)
```

**Severity Weights:**
```
REPORT_SEVERITY_WEIGHT = { low: 4, medium: 8, high: 16, critical: 24 }
```

**Tiers:** Excellent (80+), Good (65-79), Watch (45-64), Low (<45)

**Caching**: Next.js cacheLife (60 seconds) with cache tags for automatic invalidation.

---

## 9. Service Layer Architecture

### 9.1 Design Principles

- **Pure functions**: Services take plain data + userId, never handle HTTP
- **Server-only**: Every file starts with `import "server-only"`
- **Typed errors**: Throw `ServiceError` with stable domain codes
- **No framework coupling**: Return plain objects
- **Transactions**: Multi-table operations use Drizzle transactions
- **Row-level locking**: Critical paths use `FOR UPDATE`

### 9.2 Error Handling Pattern

```typescript
export class ServiceError<TCode extends string = string> extends Error {
  readonly code: TCode
  constructor(code: TCode, message: string) {
    super(message)
    this.name = "ServiceError"
    this.code = code
  }
}

// Usage
if (!company) {
  throw new ServiceError("COMPANY_NOT_FOUND", "Company does not exist")
}
```

### 9.3 Service Domains (18 total, ~230 files)

| Domain | Files | Key Capabilities |
|--------|-------|-----------------|
| `admin/` | 18 | User CRUD, bans, role changes, session revocation |
| `applications/` | 20 | Apply/withdraw, pipeline transitions, timeline events, student journeys |
| `assistant/` | 14 | Conversation CRUD, message persistence |
| `companies/` | 39 | CRUD, approval, trust index, reports, feedback |
| `departments/` | 20 | CRUD, head assignment, skill sync, bulk import, category assignment |
| `documents/` | 23 | PDF generation, verification codes, QR codes, certificate revocation |
| `interviews/` | 14 | Propose slots, confirm slot, complete, cancel, get by ID, list |
| `matching/` | 9 | Score computation, skill gap, readiness snapshots |
| `messages/` | 16 | Thread CRUD, send message, mark read |
| `notifications/` | 13 | Notification CRUD + preferences |
| `offers/` | 34 | CRUD, saved offers, AI helpers, search, recommendations |
| `placements/` | 10 | Pending list, validate/reject, AI summary |
| `skills/` | 8 | Skill tag CRUD, prioritized listing, categories |
| `stats/` | 5 | Dashboard aggregates (admin, university, department) |
| `students/` | 40 | Profile CRUD, CV management |
| `universities/` | 21 | CRUD, approval, domains, membership queries, logo upload |
| `uploads/` | 2 | S3 upload helpers |
| `users/` | 10 | Current user ops, session management |

**Note:** `uploadAvatar` and `deleteAvatar` are implemented directly in the oRPC route layer (`src/server/orpc/routes/users.ts`), not in the `users/` service domain. They delegate to generic upload utilities and `updateMe`.

---

## 10. Frontend Architecture

### 10.1 App Router Structure (~72 pages)

```
app/
├── layout.tsx                    # Root layout
├── page.tsx                      # Root redirect -> /en
├── globals.css                   # Design tokens + CSS variables
├── api/
│   ├── auth/[...all]/            # Better Auth handler
│   ├── rpc/[...rest]/            # oRPC handler
│   ├── assistant/chat/           # AI streaming endpoint
│   ├── assistant/auth/status/    # Arcade auth check
│   ├── openapi/spec/             # OpenAPI JSON
│   ├── openapi/                  # Swagger UI
│   ├── health/                   # Health check
│   └── maintenance/status/       # Maintenance status
└── [locale]/                     # i18n routes (en, fr, ar)
    ├── layout.tsx                # Locale layout
    ├── page.tsx                  # Landing page
    ├── _components/              # Landing components
    ├── (auth)/                   # Login, signup, reset-password, reset-password/verify
    ├── (authenticated)/          # Dashboard routes
    │   └── dashboard/
    │       ├── company/          # Offers, candidates, team, documents
    │       ├── student/          # Search, applications, profile, CV, saved-offers
    │       ├── admin/            # Command center (users, companies, universities, stats, validations, departments, fields, site-settings)
    │       ├── explore/          # Offer discovery
    │       ├── applications/     # Application tracking
    │       ├── candidates/       # Candidate management
    │       ├── assistant/        # AI copilot
    │       ├── dept-validations/ # Department head validation workflow
    │       ├── interviews/       # Interview scheduling
    │       ├── messages/         # Message threads
    │       ├── notifications/    # Notification center
    │       ├── profile/          # User profile
    │       ├── settings/         # Account + 2FA
    │       └── university/       # University admin dashboard
    ├── about/                    # About page
    ├── company/                  # Public company directory
    ├── company/[slug]/           # Public company profile
    ├── cookies/                  # Cookie policy
    ├── discover/                 # Public offer discovery
    ├── for-companies/            # Marketing page
    ├── for-students/             # Marketing page
    ├── goodbye/                  # Account deletion confirmation
    ├── maintenance/              # Maintenance mode page
    ├── onboarding/               # Setup wizards (student, company, university)
    ├── preview/agreement/        # Agreement preview
    ├── privacy/                  # Privacy policy
    ├── status/                   # Account status pages
    ├── terms/                    # Terms of service
    ├── verify/                   # Public doc verification
    └── profile/[userId]/         # Public profiles
```

### 10.2 Feature Folder Architecture

Components exceeding 150 lines become feature folders:

```
FeatureName/
  index.tsx              # Orchestrator (max 120 lines)
  hooks/
    useFeatureData.ts    # useQuery/useMutation
    useFeatureState.ts   # Complex UI state
  components/
    SectionA.tsx         # Pure UI, props only (max 200 lines)
  types.ts
  utils.ts
```

### 10.3 Design System: "Morning Press / Night Edition"

**Editorial aesthetic**: Warm parchment backgrounds, ink foregrounds, magazine layouts.

**Fonts:** Headlines: DM Serif Display, Body: DM Sans, Arabic: Noto Sans Arabic

**Color Space:** OkLch for perceptually uniform transitions.

**Themes:**
- Light: `--background: oklch(0.975 0.008 85)` (warm parchment)
- Dark: `--background: oklch(0.145 0.01 60)` (deep warm ink)

**Animation:** Import from `@/lib/animations.ts` — never define locally.

---

## 11. Internationalization & RTL

### 11.1 Configuration

**Routing** (`src/i18n/routing.ts`):
```typescript
export const routing = defineRouting({
  locales: ["en", "fr", "ar"],
  defaultLocale: "en",
  localePrefix: "always",  // /en/dashboard, /fr/dashboard, /ar/dashboard
})
```

**Fallback**: If a translation missing, falls back to English.

### 11.2 RTL Implementation

- `dir="rtl"` on `<html>` when locale is `ar`
- All CSS uses logical properties: `ms-*`/`me-*` instead of `ml-*`/`mr-*`

| Physical | Logical |
|----------|---------|
| `ml-*` / `mr-*` | `ms-*` / `me-*` |
| `pl-*` / `pr-*` | `ps-*` / `pe-*` |
| `left-*` / `right-*` | `start-*` / `end-*` |
| `text-left` / `text-right` | `text-start` / `text-end` |

### 11.3 Translation Structure

```
src/messages/{en,fr,ar}.json
├── metadata         — Page titles, descriptions
├── nav              — Navigation labels
├── hero             — Headlines, CTAs
├── features         — Feature cards
├── auth             — Login, signup, validation
├── onboarding       — Setup wizards
└── dashboard        — Extensive nested structure
    ├── company (offers, candidates, profile)
    ├── student (profile, applications, documents)
    ├── explore, offerDetail
    ├── applications
    └── admin (validations, stats, users)
```

---

## 12. Infrastructure & Deployment

### 12.1 Docker Production Stack

```yaml
services:
  app:
    image: ${APP_IMAGE}
    environment:
      - DATABASE_URL=postgresql://...@db:5432/...
      - REDIS_URL=redis://redis:6379
  db:
    image: postgres:16-alpine
    volumes: ["pgdata:/var/lib/postgresql/data"]
  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 48mb --maxmemory-policy allkeys-lru --appendonly yes
  caddy:
    image: caddy:2-alpine
    ports: ["80:80", "443:443"]
  backup:
    image: postgres-backup-local
```

### 12.2 Resource Budget (2GB Server)

| Service | Memory |
|---------|--------|
| PostgreSQL | 384 MB |
| Next.js App | 512 MB |
| Redis | 64 MB |
| Caddy | 64 MB |
| Backup | 64 MB |
| OS + Docker | ~300 MB |
| **Total** | **~1.39 GB** |

### 12.3 CI/CD Pipeline

```
Push to main/master
    |
    v
CI: lint -> typecheck -> tests -> build
    |
    v
CD: Docker build -> push to GHCR -> SSH to VPS -> update APP_IMAGE
    -> docker compose recreate -> run migrations -> serve traffic

**Note:** The E2E job is currently disabled (`if: false`) in CI.
```

### 12.4 Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

### 12.5 Logging

Pino structured JSON logging with automatic redaction of auth tokens, passwords, API keys.

---

## 13. Security Considerations

### 13.1 Authentication Security
- Passwords hashed with bcrypt
- Email verification required
- 2FA with TOTP + email OTP + backup codes
- Session expiry and rotation
- Multi-device management (max 5)
- Admin impersonation with audit trail

### 13.2 Authorization Security
- Middleware-level RBAC
- Department head scoping
- University admin scoping
- Company membership validation (one per user)
- Approval gates for admin accounts

### 13.3 API Security
- Rate limiting per user/IP (Redis + in-memory fallback)
- Input validation via Zod schemas
- SQL injection prevention via parameterized Drizzle queries

### 13.4 Data Security
- PII redaction before AI context storage
- Secret stripping in assistant messages
- File type validation on uploads
- Image size limits

---

## 14. Testing Strategy

### 14.1 Test Architecture

- **Runner**: Bun test (`bun:test`)
- **DOM**: happy-dom for browser globals
- **Matchers**: jest-dom extended on `expect`
- **Pattern**: Co-located tests (`*.test.ts` next to source)

### 14.2 Test Commands

```bash
bun test                # All tests
bun test:watch          # Watch mode
bun test:e2e            # Playwright E2E
bun test:coverage       # Coverage reports
bun test:ci             # CI pipeline
bun run check:all       # Full pre-release checks
```

### 14.3 E2E Testing

- Playwright with Chromium
- Auto-starts dev server
- PostgreSQL service container configured in CI (E2E job currently disabled)
- Screenshots on failure, trace on first retry

---

## 15. Feature Flags & Configuration

| Flag | Default | Description |
|------|---------|-------------|
| `FEATURE_SAVED_OFFERS` | `true` | Bookmark offers |
| `FEATURE_INTERVIEWS` | `true` | Interview scheduling |
| `FEATURE_LANGUAGE_REQUIREMENTS` | `true` | Language requirements |
| `FEATURE_NOTIF_PREFERENCES` | `true` | Notification settings |
| `FEATURE_COMPANY_ASSISTANT` | `false` | AI assistant for companies |

Client-side flags use `NEXT_PUBLIC_` prefix and are baked into the bundle at build time.

---

## 16. File Structure

### 16.1 Complete Directory Tree

```
licence-last/
├── .env.example                    # Environment variable template
├── .env.development               # Development env
├── .env.production                # Production env
├── .env.e2e                       # E2E test env
├── docker-compose.prod.yml        # Production Docker Compose
├── Dockerfile                     # Multi-stage Docker build
├── Caddyfile                      # Caddy reverse proxy config
├── drizzle.config.ts              # Drizzle Kit configuration
├── playwright.config.ts           # Playwright E2E config
├── next.config.ts                 # Next.js configuration
├── postcss.config.mjs             # PostCSS (Tailwind)
├── components.json                # shadcn/ui config
├── biome.json                     # Biome lint/format config
├── bunfig.toml                    # Bun configuration
├── package.json                   # Dependencies & scripts
├── tsconfig.json                  # TypeScript configuration
├── README.md                      # Project overview
├── AGENTS.md                      # AI agent coding guidelines
├── CLAUDE.md                      # Claude Code context
├── docs/
│   ├── ARCHITECTURE.md            # Full architecture document
│   └── DEPLOYMENT.md              # Deployment guide
├── src/
│   ├── app/                       # Next.js App Router (~72 pages)
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Root redirect
│   │   ├── globals.css            # Design tokens + CSS variables
│   │   ├── api/
│   │   │   ├── auth/[...all]/     # Better Auth handler
│   │   │   ├── rpc/[...rest]/     # oRPC handler
│   │   │   ├── assistant/chat/    # AI streaming endpoint
│   │   │   ├── assistant/auth/status/
│   │   │   ├── openapi/spec/      # OpenAPI JSON
│   │   │   ├── openapi/           # Swagger UI
│   │   │   ├── health/            # Health check
│   │   │   └── maintenance/status/# Maintenance status
│   │   └── [locale]/              # i18n routes (en, fr, ar)
│   │       ├── layout.tsx         # Locale layout
│   │       ├── page.tsx           # Landing page
│   │       ├── _components/       # Landing components
│   │       ├── (auth)/            # Login, signup, reset
│   │       ├── (authenticated)/   # Dashboard routes
│   │       │   └── dashboard/
│   │       │       ├── company/   # Offers, candidates, team, documents
│   │       │       ├── student/   # Search, applications, CV, saved-offers
│   │       │       ├── admin/     # Command center
│   │       │       ├── explore/   # Offer discovery
│   │       │       ├── applications/
│   │       │       ├── candidates/
│   │       │       ├── assistant/ # AI copilot
│   │       │       ├── dept-validations/ # Dept head workflow
│   │       │       ├── interviews/# Interview scheduling
│   │       │       ├── messages/  # Message threads
│   │       │       ├── notifications/
│   │       │       ├── profile/
│   │       │       ├── settings/  # Account + 2FA
│   │       │       └── university/# University admin
│   │       ├── about/             # About page
│   │       ├── company/           # Public company directory
│   │       ├── company/[slug]/    # Public company profile
│   │       ├── cookies/           # Cookie policy
│   │       ├── discover/          # Public offer discovery
│   │       ├── for-companies/     # Marketing page
│   │       ├── for-students/      # Marketing page
│   │       ├── goodbye/           # Account deletion confirmation
│   │       ├── maintenance/       # Maintenance mode page
│   │       ├── onboarding/        # Setup wizards
│   │       ├── preview/agreement/ # Agreement preview
│   │       ├── privacy/           # Privacy policy
│   │       ├── status/            # Account status pages
│   │       ├── terms/             # Terms of service
│   │       ├── verify/            # Public verification
│   │       └── profile/[userId]/  # Public profiles
│   ├── components/
│   │   ├── ui/                    # 28 shadcn components
│   │   ├── form-fields/           # Reusable form inputs
│   │   ├── providers/             # Context providers
│   │   └── [shared components]    # Navbar, Footer, etc.
│   ├── hooks/                     # Shared React hooks
│   ├── lib/
│   │   ├── utils.ts               # cn() class merge
│   │   ├── animations.ts          # Motion presets
│   │   ├── auth.ts                # Better Auth config
│   │   ├── auth-client.ts         # Better Auth client
│   │   ├── auth-guards.ts         # RSC role guards
│   │   ├── permissions.ts         # Access control matrix
│   │   ├── schemas/               # Zod schemas (10 files)
│   │   └── constants/             # Shared constants
│   ├── server/
│   │   ├── db/
│   │   │   ├── index.ts           # Drizzle client
│   │   │   ├── schema/            # 24 schema modules
│   │   │   ├── migrations/        # Drizzle migrations
│   │   │   ├── seed.ts            # Seed data
│   │   │   └── reset.ts           # DB reset script
│   │   ├── orpc/
│   │   │   ├── middleware.ts      # Auth procedure chain
│   │   │   ├── rate-limited-procedures.ts  # 25 variants
│   │   │   ├── ratelimit-middleware.ts
│   │   │   ├── router.ts          # Combined router (172 procedures)
│   │   │   ├── client.ts          # orpcClient + orpc (TanStack)
│   │   │   └── routes/            # 20 route modules
│   │   ├── services/              # 18 business domains (~350 files)
│   │   │   ├── admin/ (18 files)
│   │   │   ├── applications/ (20)
│   │   │   ├── assistant/ (14)
│   │   │   ├── companies/ (39)
│   │   │   ├── departments/ (20)
│   │   │   ├── documents/ (23)
│   │   │   ├── interviews/ (14)
│   │   │   ├── matching/ (9)
│   │   │   ├── messages/ (16)
│   │   │   ├── notifications/ (13)
│   │   │   ├── offers/ (34)
│   │   │   ├── placements/ (10)
│   │   │   ├── skills/ (8)
│   │   │   ├── stats/ (5)
│   │   │   ├── students/ (40)
│   │   │   ├── universities/ (21)
│   │   │   ├── uploads/ (2)
│   │   │   └── users/ (10)
│   │   ├── ai/
│   │   │   ├── model.ts           # Provider routing
│   │   │   ├── chat-handler.ts    # Stream handler
│   │   │   ├── prompts.ts         # System prompts
│   │   │   ├── context.ts         # Context minimization
│   │   │   ├── access.ts          # Intent-based access
│   │   │   ├── auto-title.ts      # Title generation
│   │   │   ├── sanitizer.ts       # Message sanitization
│   │   │   ├── persistence.ts     # Conversation persistence
│   │   │   ├── rate-limit.ts      # AI rate limiting
│   │   │   ├── types.ts           # AI type definitions
│   │   │   └── tools/             # Internal + Arcade tools
│   │   ├── openapi/
│   │   │   └── generator.ts       # OpenAPI spec generation
│   │   ├── pdfs/
│   │   │   ├── AgreementTemplate.tsx
│   │   │   └── CertificateTemplate.tsx
│   │   ├── storage/
│   │   │   └── s3.ts              # S3-compatible wrapper
│   │   ├── email/
│   │   │   ├── sendEmail.ts
│   │   │   └── templates/         # React Email components
│   │   ├── caching/
│   │   │   ├── redis.ts           # Redis client
│   │   │   └── redis-ratelimiter.ts # Rate limiter (Redis + in-memory fallback)
│   │   ├── logging/
│   │   │   └── index.ts           # Pino structured logging
│   │   ├── auth/
│   │   │   ├── get-fresh-session.ts
│   │   │   └── approval-gate.ts
│   │   └── mcp/                   # Dev-only MCP server
│   ├── i18n/
│   │   ├── routing.ts             # Locale routing config
│   │   ├── request.ts             # Request-scoped locale
│   │   └── messages.ts            # Message merging utilities
│   ├── messages/
│   │   ├── en.json                # English translations
│   │   ├── fr.json                # French translations
│   │   └── ar.json                # Arabic translations
│   ├── env.ts                     # T3 Env validation (Zod)
│   └── proxy.ts                   # Next.js proxy middleware
└── scripts/                       # Build/lint utility scripts
```

---

## Appendix A: Key Algorithms Summary

### A.1 Matching Algorithm

```
Input: studentUserId, offerId
Output: MatchScoreResult (0-100)

1. Fetch offer, student profile, offer skills, student skills,
   language requirements, student languages (parallel)
2. Compute skills score:
   matched = intersection(offerSkills, studentSkills)
   skillsScore = round(|matched| / |offerSkills| * 55)
3. Compute language score:
   For each requirement:
     met = PROFICIENCY_RANK[student] >= PROFICIENCY_RANK[required]
     weighted sum
   Apply penalty for missing required languages
4. Compute location score:
   Remote -> full points
   Same wilaya -> full points
   Different wilaya -> reduced (hybrid less penalty)
5. Compute profile score:
   Count completeness signals
   profileScore = round(ratio * 10)
6. Return clamped total + breakdown + missing skills + fairness notes
```

### A.2 Trust Index Algorithm

```
Input: companyId
Output: CompanyTrustIndex

1. Fetch all company offers
2. Count applications by status across all offers
3. Compute responseRate = responded / total
4. Compute completionRate = validated / accepted
5. Compute feedbackScore = (avgRating/5)*70 + recommendRate*30
6. Compute reportPenalty = sum(severityWeight for unresolved reports)
7. trustScore = clamp(responseRate*0.3 + completionRate*0.3 +
                      feedbackScore*0.3 - min(40, penalty) + 10)
8. Determine tier from score thresholds
9. Generate alerts based on conditions
```

---

## Appendix B: Environment Variables Reference

### Required (Production)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Auth encryption key (min 32 chars) |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Public app URL |
| `AI_API_KEY` | Primary AI provider key |
| `AI_MODEL` | AI model identifier (e.g., `openai/gpt-4o`) |
| `AI_ALLOWED_MODELS` | Comma-separated allowed models |
| `AI_BASE_URL` | AI provider base URL |
| `RESEND_API_KEY` | Email service API key |
| `EMAIL_FROM` | Sender email address |
| `S3_BUCKET` / `S3_BUCKET_NAME` | S3 bucket name |
| `S3_ENDPOINT` | S3-compatible endpoint |
| `S3_ACCESS_KEY_ID` / `AWS_ACCESS_KEY_ID` | Storage access key |
| `S3_SECRET_ACCESS_KEY` / `AWS_SECRET_ACCESS_KEY` | Storage secret key |
| `S3_PUBLIC_URL` / `NEXT_PUBLIC_S3_URL` | Public CDN URL |
| `S3_REGION` | S3 region |

### Optional

| Variable | Description |
|----------|-------------|
| `REDIS_URL` | Redis connection for rate limiting |
| `REDIS_RATE_LIMIT_ENABLED` | Enable Redis rate limiting |
| `ARCADE_API_KEY` | External AI tools (GitHub, Gmail) |
| `TURNSTILE_SECRET_KEY` | Bot protection |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key (client) |
| `NEXT_PUBLIC_E2E_DISABLE_CAPTCHA` | Disable captcha in E2E tests |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Trusted origins for auth |
| `LOG_LEVEL` | Pino log level (default: info) |
| `FEATURE_*` / `NEXT_PUBLIC_FEATURE_*` | Feature flags |
| `RUN_SEED` | Run database seed on startup |
| `SEED_ADMIN_EMAIL` | Seed super admin email |
| `SEED_ADMIN_PASSWORD` | Seed super admin password |
| `SEED_UNIVERSITY_ADMIN_EMAIL` | Seed university admin email |
| `SEED_UNIVERSITY_ADMIN_PASSWORD` | Seed university admin password |
| `SEED_UNIVERSITY_ADMIN_UNIVERSITY_NAME` | Seed university name |

---

*End of THESIS.md*
