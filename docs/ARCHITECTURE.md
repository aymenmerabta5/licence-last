# Architecture Document — Stag Platform

> Last updated: 2026-02-18
> Version: 1.2

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [Directory Structure](#3-directory-structure)
4. [Data Model](#4-data-model)
5. [MVC Architecture](#5-mvc-architecture)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [API Surface](#7-api-surface)
8. [Frontend Architecture](#8-frontend-architecture)
9. [Internationalization & RTL](#9-internationalization--rtl)
10. [Design System](#10-design-system)
11. [AI & Assistant System](#11-ai--assistant-system)
12. [Matching & Trust Systems](#12-matching--trust-systems)
13. [Infrastructure & Deployment](#13-infrastructure--deployment)
14. [Testing Architecture](#14-testing-architecture)

---

## 1. System Overview

**Stag** is a full-stack web platform connecting Algerian companies with university students for internships (stages). The platform manages the complete internship lifecycle: company onboarding, offer creation, student discovery, application pipeline, placement validation, and feedback/trust scoring.

### High-Level Architecture

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
                   Better Auth 131 procs  AI SDK Gateway/Poe
                          \       |      /
                       ┌──────────────────────┐
                       │   Services Layer     │
                       │  (18 domains)        │
                       └──────────┬───────────┘
                                  |
                    ┌─────────────┼─────────────┐
                    │             │             │
               PostgreSQL     Redis         S3/R2
               (Drizzle)    (Rate limit)   (Files)
```

### Core User Roles

| Role | Description | Capabilities |
|------|-------------|-------------|
| `student` | University-affiliated user | Browse offers, apply, track applications |
| `company_admin` | Company recruiter | Create offers, manage pipeline, AI assistant |
| `dept_head` | Department head | Validate placements for their department |
| `university_admin` | University administrator | Validate placements, manage departments, view stats |
| `super_admin` | Platform operator | Full control: users, companies, universities, departments |

---

## 2. Technology Stack

### Core Framework

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Bun | 1.x |
| Framework | Next.js | 16.1.6 |
| React | React | 19.2.3 |
| Language | TypeScript | 5.x (strict) |

### Frontend

| Category | Technology | Version |
|----------|-----------|---------|
| Styling | Tailwind CSS | 4.x (`@theme inline`) |
| Components | shadcn/ui | 3.8.3 (base-nova) |
| Animation | motion | 12.33.0 |
| Icons | lucide-react | 0.563.0 |
| Fonts | DM Sans, DM Serif Display, Noto Sans Arabic | Google Fonts |
| Charts | recharts | 2.15.4 |
| Toasts | sonner | 2.0.7 |
| Drawers | vaul | 1.1.2 |

### State & Data

| Category | Technology | Version |
|----------|-----------|---------|
| Server State | @tanstack/react-query | 5.90.20 |
| Forms | @tanstack/react-form | 1.28.0 |
| Validation | zod | 4.3.6 |
| ORM | drizzle-orm | 0.45.1 |
| Database | PostgreSQL | 16 |
| Driver | postgres | 3.4.5 |

### Backend & API

| Category | Technology | Version |
|----------|-----------|---------|
| RPC Framework | @orpc/server + @orpc/client | 1.13.4 |
| Query Integration | @orpc/tanstack-query | 1.13.4 |
| Rate Limiting | @orpc/experimental-ratelimit | 1.13.5 |
| Authentication | better-auth | 1.4.18 |

### AI & External Services

| Category | Technology | Version |
|----------|-----------|---------|
| AI SDK | ai (Vercel) | 6.0.78 |
| LLM Provider | @ai-sdk/openai (gateway + Poe-compatible) | 3.0.26 |
| Tool Integration | @arcadeai/arcadejs | 2.2.0 |
| Email | resend + @react-email | 6.9.1 |
| PDF | @react-pdf/renderer | 4.3.2 |

### i18n & Theming

| Category | Technology |
|----------|-----------|
| Internationalization | next-intl 4.8.2 |
| Theming | next-themes 0.4.6 |

### Infrastructure

| Category | Technology |
|----------|-----------|
| Container | Docker (multi-stage) |
| Orchestration | Docker Compose |
| Reverse Proxy | Caddy 2 (auto-HTTPS) |
| Auto-Deploy | Watchtower |
| CI/CD | GitHub Actions |
| Registry | GitHub Container Registry (ghcr.io) |
| Logging | Pino 10.x (structured JSON) |

---

## 3. Directory Structure

```
src/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout (minimal pass-through)
│   ├── page.tsx                      # Root redirect -> /en
│   ├── globals.css                   # Design tokens + theme variables
│   ├── api/
│   │   ├── auth/[...all]/            # Better Auth catch-all
│   │   ├── rpc/[...rest]/            # oRPC catch-all (CSRF protected)
│   │   ├── assistant/chat/           # AI streaming endpoint
│   │   ├── assistant/auth/status/    # Arcade auth check
│   │   ├── openapi/spec/            # OpenAPI JSON specification
│   │   ├── openapi/                  # Swagger UI
│   │   └── health/                   # Health check (GET)
│   └── [locale]/                     # i18n routes (en, fr, ar)
│       ├── layout.tsx                # Locale layout (providers, fonts)
│       ├── page.tsx                  # Landing page
│       ├── _components/              # Landing components
│       ├── (auth)/                   # Auth route group (public)
│       │   ├── login/
│       │   ├── signup/
│       │   └── reset-password/
│       ├── (authenticated)/          # Protected route group
│       │   ├── _components/          # Shared dashboard components
│       │   └── dashboard/
│       │       ├── page.tsx          # Dashboard home (role redirect)
│       │       ├── company/          # Company views
│       │       ├── student/          # Student views
│       │       ├── admin/            # Admin views
│       │       ├── explore/          # Offer discovery
│       │       ├── applications/     # Application tracking
│       │       ├── candidates/       # Candidate management
│       │       ├── assistant/        # AI copilot
│       │       ├── notifications/    # Notification center
│       │       ├── profile/          # User profile
│       │       └── settings/         # Account settings + 2FA
│       ├── onboarding/               # Setup wizards
│       │   ├── company/
│       │   ├── student/
│       │   └── university/
│       ├── verify/                   # Document verification (public)
│       │   ├── page.tsx              # Verification form
│       │   └── [code]/page.tsx       # Verification result
│       └── profile/[userId]/         # Public profiles
│
├── components/                       # Shared UI components
│   ├── ui/                           # shadcn/ui primitives (40+ components)
│   ├── form-fields/                  # Reusable form components
│   │   ├── TextField.tsx
│   │   ├── TextAreaField.tsx
│   │   ├── SelectField.tsx
│   │   ├── PasswordField.tsx
│   │   ├── CheckboxField.tsx
│   │   └── FormSection.tsx
│   ├── providers/                    # Context providers
│   ├── LanguageSwitcher.tsx
│   ├── ThemeToggle.tsx
│   ├── NotificationBell.tsx
│   ├── FormHeader.tsx
│   ├── SubmitButton.tsx
│   ├── ServerError.tsx
│   └── SuccessMessage.tsx
│
├── hooks/                            # Shared hooks
│   ├── useCopilot.ts                 # AI chat transport + tool output
│   ├── useInfiniteScroll.ts          # IntersectionObserver pagination
│   ├── useDebounce.ts                # Value debouncing
│   ├── useLogout.ts                  # Auth signout + redirect
│   ├── useFormWithSchema.ts          # TanStack Form + Zod
│   ├── use-mobile.ts                 # Responsive breakpoint
│   ├── use-skill-grouping.ts         # Skill categorization
│   └── use-skill-selection.ts        # Multi-select state
│
├── lib/                              # Shared utilities
│   ├── utils.ts                      # cn() class merge
│   ├── animations.ts                 # Motion presets (reveal, ease, fadeIn)
│   ├── auth.ts                       # Better Auth server config
│   ├── auth-client.ts                # Better Auth client
│   ├── auth-guards.ts                # requireRole() for RSC layouts
│   ├── permissions.ts                # Access control matrix
│   ├── navigation.ts                 # localeRedirect()
│   ├── error-message.ts              # Error extraction
│   ├── image-validation.ts           # File type validation
│   ├── wilayas.ts                    # Algerian provinces
│   ├── schemas/                      # Zod schemas (shared client+server, 10 files)
│   │   ├── auth.ts, company.ts, student.ts, offer.ts
│   │   ├── search.ts, matching.ts, university.ts, verify.ts
│   │   ├── enums.ts, map-errors.ts
│   └── constants/
│       ├── pipeline.ts               # STAGE_COLUMNS, STATUS_COLORS
│       └── internship.ts             # INTERNSHIP_TYPE_LABELS
│
├── server/                           # Server-only code
│   ├── db/
│   │   ├── index.ts                  # Drizzle client
│   │   ├── schema/                   # 19 schema modules
│   │   ├── migrations/               # Drizzle migrations
│   │   ├── seed.ts                   # Seed data (universities, skills, admin)
│   │   └── reset.ts                  # Database reset script
│   ├── orpc/                         # Controller layer
│   │   ├── middleware.ts             # Auth procedure chain (7 types)
│   │   ├── rate-limited-procedures.ts  # 20 variants
│   │   ├── ratelimit-middleware.ts
│   │   ├── router.ts                 # Combined router (131 procedures / 19 namespaces)
│   │   ├── client.ts                 # orpcClient + orpc (TanStack)
│   │   └── routes/                   # 18 route modules
│   ├── services/                     # Business logic (18 domains)
│   │   ├── admin/                    # User management (17 files)
│   │   ├── applications/             # Application workflow (16 files)
│   │   ├── assistant/                # AI conversations (8 files)
│   │   ├── companies/                # Company management (25 files)
│   │   ├── departments/              # Department management (17 files)
│   │   ├── documents/                # PDF gen + verification (15 files)
│   │   ├── interviews/               # Interview scheduling (5 files)
│   │   ├── matching/                 # Scoring algorithm (7 files)
│   │   ├── messages/                 # Thread messaging (7 files)
│   │   ├── notifications/            # Notification CRUD + preferences (10 files)
│   │   ├── offers/                   # Offer management + AI helpers (30 files)
│   │   ├── placements/               # Placement validation + summaries (7 files)
│   │   ├── skills/                   # Skill tags (5 files)
│   │   ├── stats/                    # Analytics (4 files)
│   │   ├── students/                 # Profile + CV management (24 files)
│   │   ├── universities/             # University management (12 files)
│   │   ├── uploads/                  # S3 file storage (2 files)
│   │   └── users/                    # Current user/session ops (10 files)
│   ├── ai/                           # AI integration
│   │   ├── model.ts                  # AI provider routing (gateway/Poe)
│   │   ├── chat-handler.ts           # Stream handler
│   │   ├── tools/                    # Internal + Arcade tools
│   │   ├── context.ts                # Context minimization
│   │   ├── prompts.ts                # System prompts per persona
│   │   └── access.ts                 # Intent-based access control
│   ├── openapi/generator.ts          # OpenAPI spec from oRPC router
│   ├── pdfs/                         # PDF templates
│   │   ├── AgreementTemplate.tsx     # Internship agreement
│   │   └── CertificateTemplate.tsx   # Completion certificate
│   ├── storage/s3.ts                 # Bun S3Client wrapper
│   ├── email/sendEmail.ts            # Resend + React Email
│   ├── caching/                      # Redis client + rate limiter
│   ├── logging/                      # Pino structured logging
│   └── mcp/                          # Dev-only MCP server
│
├── i18n/                             # next-intl config
│   ├── routing.ts                    # Locale routing (en, fr, ar)
│   └── request.ts                    # Request-scoped locale
│
├── messages/                         # Translation JSON files
│   ├── en.json                       # English
│   ├── fr.json                       # French
│   └── ar.json                       # Arabic
│
├── env.ts                            # T3 Env validation
└── proxy.ts                          # Middleware (i18n + auth guards)
```

---

## 4. Data Model

### Entity-Relationship Overview

```
University ──1:N──> Department ──1:N──> User (dept_head via departmentId)
     |                                    |
     ├──1:N──> User (students via universityId)
     |                |
     |            1:1 |──> StudentProfile
     |                |──> StudentSkill ──N:1──> SkillTag
     |                |──> StudentLanguage
     |                |──> Notification
     |                |──> Session, Account, Verification
     |
Company ──1:N──> CompanyMember ──N:1──> User
     |
     |──1:N──> InternshipOffer
     |              |──N:M──> SkillTag (via InternshipOfferSkill)
     |              |──1:N──> LanguageRequirement
     |              |──1:N──> Application
     |                            |──1:1──> Placement
     |                            |             |──1:N──> PlacementDocument
     |                            |             |──1:N──> CompanyQualityFeedback
     |                            |──1:N──> ApplicationTimelineEvent
     |
     |──1:N──> AssistantConversation ──1:N──> AssistantMessage
     |──1:N──> CompanyQualityFeedback
     |──1:N──> CompanyReport
     |
StudentOfferReadinessSnapshot (student + offer pair)
RateLimitBucket (Redis fallback)
TwoFactor (user 2FA secrets)
```

### Database Enums (16 total)

| Enum | Values |
|------|--------|
| `userRole` | student, company_admin, dept_head, university_admin, super_admin |
| `companyStatus` | pending, approved, rejected, suspended |
| `universityStatus` | pending, approved, rejected |
| `universityDomainStatus` | pending, approved, rejected, disabled |
| `companyMemberRole` | owner, recruiter |
| `offerStatus` | draft, published, closed |
| `workMode` | on_site, hybrid, remote |
| `internshipType` | pfe, immersion, summer, practical |
| `applicationStatus` | applied, company_accepted, company_refused, admin_validated, admin_rejected, withdrawn |
| `applicationPipelineStage` | applied, screening, interview, offer, accepted, rejected |
| `documentType` | agreement, certificate |
| `documentStatus` | pending, generated, failed |
| `proficiencyLevel` | a1, a2, b1, b2, c1, c2, native |
| `companyReportStatus` | open, reviewing, resolved, dismissed |
| `companyReportSeverity` | low, medium, high, critical |
| `assistantMessageRole` | system, user, assistant |

### Key Tables

**Authentication**: `user`, `session`, `account`, `verification`, `twoFactor`

**Academic**: `university`, `universityDomain`, `department`

**Corporate**: `company`, `companyMember`

**Student**: `studentProfile`, `studentSkill`, `studentLanguage`

**Internships**: `internshipOffer`, `internshipOfferSkill`, `internshipOfferLanguageRequirement`

**Applications**: `application`, `applicationTimelineEvent`

**Placements**: `placement`, `placementDocument` (agreement/certificate PDFs)

**AI**: `assistantConversation`, `assistantMessage`

**Trust**: `companyQualityFeedback`, `companyReport`

**Analytics**: `studentOfferReadinessSnapshot`

**Infrastructure**: `rateLimitBucket` (Redis fallback)

---

## 5. MVC Architecture

### Model Layer (`src/server/services/`)

Pure business logic functions. Every file starts with `import "server-only"`.

- Functions take plain data + userId -- **never** handle auth
- Import `db` from `@/server/db` and schema from `@/server/db/schema`
- Return typed data -- no `NextResponse`, no `ORPCError`
- Throw typed `ServiceError` codes for domain failures (instead of generic `Error`)
- Use transactions for multi-table operations
- Row-level locking where needed (e.g., `applyToOffer` prevents race conditions)

**18 Service Domains**:

| Domain | Files | Key Functions |
|--------|-------|--------------|
| `admin/` | 17 | user lifecycle, role changes, bans, session revocation, password reset |
| `applications/` | 16 | apply/withdraw, pipeline transitions, timelines, offer search helpers |
| `assistant/` | 8 | conversation CRUD, message append/list, model/title updates |
| `companies/` | 25 | CRUD, approval/suspension, trust index, reports, quality feedback |
| `departments/` | 17 | CRUD, head assignment by id/email, skill sync, bulk import |
| `documents/` | 15 | agreement/certificate generation, verification, listings, downloads |
| `interviews/` | 5 | propose slots, confirm slot, list for company/student |
| `matching/` | 7 | score, skill gap, readiness history and snapshots |
| `messages/` | 7 | company/student threads, send message, mark read |
| `notifications/` | 10 | listing/mark-read plus preference get/update |
| `offers/` | 30 | CRUD, saved offers, AI draft/improve/suggest helpers |
| `placements/` | 7 | pending list, validate/reject, AI validation summary |
| `skills/` | 5 | list/prioritized skill tags and validation helpers |
| `stats/` | 4 | admin and university dashboard aggregates |
| `students/` | 24 | student profile CRUD and CV experience/project/resume ops |
| `universities/` | 12 | CRUD, approval/rejection, status checks |
| `uploads/` | 2 | S3 image/file upload helpers |
| `users/` | 10 | me/profile/session management |

### Controller Layer (`src/server/orpc/`)

oRPC router handling ALL client-server communication with auth middleware.

**Middleware Chain**:
```
publicProcedure              -- No auth required
├── authedProcedure          -- Valid session required
│   ├── adminProcedure       -- university_admin, dept_head, or super_admin
│   ├── superAdminProcedure  -- super_admin only
│   ├── companyAdminProcedure -- company_admin + injects companyMembership
│   ├── studentProcedure     -- student role + injects studentProfile
│   └── deptHeadProcedure    -- dept_head + injects departmentId + universityId
```

**Rate-Limited Procedure Variants (20)**:

| Procedure | Limit | Use Case |
|-----------|-------|----------|
| publicProcedureStrict | 5/min | Auth endpoints |
| publicProcedureStandard | 100/min | Public reads |
| authedProcedureStandard | 100/min | General API |
| authedSessionProcedureStandard | 100/min | Session bootstrap endpoints |
| authedProcedureGenerous | 300/min | Listings/search |
| authedSessionProcedureGenerous | 300/min | Session bootstrap reads |
| authedProcedureStrict | 5/min | Sensitive ops |
| adminProcedureStandard | 100/min | Admin ops |
| adminProcedureGenerous | 300/min | Bulk admin |
| adminProcedureAssistant | 20/min | Admin/dept-head AI calls |
| superAdminProcedureStandard | 100/min | Super admin ops |
| superAdminProcedureGenerous | 300/min | Bulk super admin |
| deptHeadProcedureStandard | 100/min | Dept head ops |
| deptHeadProcedureGenerous | 300/min | Dept head reads |
| companyAdminProcedureStandard | 100/min | Company ops |
| companyAdminProcedureGenerous | 300/min | Company reads |
| companyAdminProcedureAssistant | 20/min | AI assistant |
| studentProcedureStandard | 100/min | Student mutations |
| studentProcedureGenerous | 300/min | Student reads |
| assistantProcedureLimited | 20/min | AI calls |

**131 Total Procedures across 18 Route Modules (19 Router Namespaces)**:
users (7), companies (15), skills (2), students (4), offers (15), applications (10), matching (4), placements (4), deptHead (3), departments (9), documents (7), notifications (5), interviews (4), messages (6), studentCv (9), stats (2), adminUsers (11), universities (5), assistant (9)

### View Layer

- **Server Components** call services directly (no oRPC needed)
- **Client Components** use oRPC via TanStack Query:
  - `orpcClient` for direct calls (forms, one-off operations)
  - `orpc` for reactive reads (useQuery/useMutation with cache invalidation)

---

## 6. Authentication & Authorization

### Better Auth Configuration

- **Session**: 24-hour expiry, 1-hour token refresh, 5-minute cookie cache
- **Multi-Session**: Max 5 concurrent sessions per user
- **Password Policy**: 8-128 characters, Have I Been Pwned integration
- **Email Verification**: Required on signup, auto sign-in after verification

### Plugins

1. **Admin Plugin** -- Access control matrix for user/session management
2. **Two-Factor** -- TOTP + OTP (email) + Backup codes (10 codes, 5-min OTP validity)
3. **Multi-Session** -- 5 concurrent sessions
4. **NextCookies** -- Server Action cookie handling

### University Email Domain Validation

Student signup flow:
1. Extract domain from email (e.g., `student@cs.univ-constantine2.dz`)
2. Generate candidates: `["cs.univ-constantine2.dz", "univ-constantine2.dz"]`
3. Match against `universityDomain` table (status = "approved")
4. Auto-assign `universityId` on match, reject if no match

### RSC Auth Guards

```typescript
// src/lib/auth-guards.ts
// Available roles: "student" | "company_admin" | "dept_head" | "university_admin" | "super_admin"
const user = await requireRole(["company_admin", "super_admin"])
// Redirects to login (no session) or home (wrong role)
```

### Middleware (`src/proxy.ts`)

- Protected paths: `/dashboard`, `/onboarding`, `/profile` -- redirect to login if no session
- Auth paths: `/login`, `/signup`, `/reset-password` -- redirect to home if has session
- Delegates to next-intl for locale routing

---

## 7. API Surface

### HTTP Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| ALL | `/api/auth/[...all]` | Better Auth (login, signup, 2FA, sessions) |
| ALL | `/api/rpc/[...rest]` | oRPC (131 procedures, CSRF protected) |
| POST | `/api/assistant/chat` | AI streaming (60s timeout) |
| POST | `/api/assistant/auth/status` | Arcade tool auth check |
| GET | `/api/openapi/spec` | OpenAPI JSON specification |
| GET | `/api/openapi` | Swagger UI |
| GET | `/api/health` | Readiness payload with dependency checks (`database`, `redis`, `rateLimiter`) |

### CSRF Protection

The oRPC handler validates `Origin` header against `NEXT_PUBLIC_BETTER_AUTH_URL` for state-changing requests (POST/PUT/DELETE).

### Client Configuration

```typescript
// Browser: uses current origin
// SSR: uses NEXT_PUBLIC_BETTER_AUTH_URL
const url = typeof window !== "undefined"
  ? `${window.location.origin}/api/rpc`
  : `${env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/rpc`
```

SSR requests forward cookies via `next/headers` for auth.

### Service Error Mapping Contract

- Services throw typed `ServiceError` instances with stable domain codes.
- oRPC routes normalize service failures through `createServiceORPCError(...)`.
- Unknown failures are mapped to `INTERNAL_SERVER_ERROR` with route-scoped fallback messages.

---

## 8. Frontend Architecture

### Route Structure (~47 pages)

**Public**: Landing page, public profiles, document verification (`/verify`, `/verify/[code]`)

**Auth** (`(auth)/`): Login, signup, reset-password

**Onboarding**: Company, student, university setup wizards

**Dashboard** (`(authenticated)/dashboard/`):
- **Company**: Offers CRUD, candidates pipeline, profile, pending/rejected states
- **Student**: Search, applications, offer detail, profile
- **Admin**: Command center, pending/rejected validations, users, universities, departments, stats
- **Dept Head**: Placement validations (`dept-validations/`, `dept-validations/[applicationId]`)
- **Shared**: Explorer, notifications, assistant, profile, settings

### Layout Hierarchy

```
app/layout.tsx              -- Minimal pass-through (no getLocale!)
└── [locale]/layout.tsx     -- <html>, <body>, fonts, ThemeProvider, MotionProvider, QueryProvider
    ├── (auth)/layout.tsx   -- Split editorial panel + form
    ├── (authenticated)/layout.tsx -- requireRole guard + sidebar
    └── onboarding/layout.tsx -- Onboarding wrapper
```

### Feature Folder Architecture

Components exceeding 150 lines must become feature folders:

```
FeatureName/
  index.tsx              -- Orchestrator (max 120 lines)
  hooks/
    useFeatureData.ts    -- useQuery/useMutation
    useFeatureState.ts   -- Complex UI state (optional)
  components/
    SectionA.tsx         -- Pure UI, props only (max 200 lines)
    SectionB.tsx
  types.ts
  constants.ts           -- Feature-specific only (optional)
  utils.ts               -- Helpers (optional)
```

### Key Feature Folders

| Feature | Location | Key Components |
|---------|----------|---------------|
| DashboardSidebar | `(authenticated)/_components/` | Navigation, role-based menu |
| DashboardNavbar | `(authenticated)/_components/` | Search, user dropdown, notifications |
| ProfileContent | `student/profile/_components/` | Profile header, stats, skills, education |
| OfferForm | `company/offers/_components/` | Multi-section offer editor |
| AssistantChat | `assistant/_components/` | Chat interface, tool output |
| TwoFactorSettings | `settings/_components/` | 2FA setup flow |

### Shared Infrastructure

| Module | Exports |
|--------|---------|
| `src/lib/constants/pipeline.ts` | STATUS_COLORS, STAGE_COLUMNS, STAGE_LABELS |
| `src/lib/constants/internship.ts` | INTERNSHIP_TYPE_LABELS, INTERNSHIP_TYPE_COLORS |
| `src/lib/animations.ts` | reveal, ease, fadeIn, slideUp, revealWithDelay, reduced-motion helpers |
| `src/hooks/useInfiniteScroll.ts` | IntersectionObserver + fetchNextPage |
| `src/hooks/useDebounce.ts` | Debounced value |
| `src/hooks/useLogout.ts` | Logout + redirect |
| `src/hooks/useCopilot.ts` | AI chat transport + tool output parsing |

---

## 9. Internationalization & RTL

### Supported Locales

| Locale | Language | Direction | Font |
|--------|----------|-----------|------|
| `en` | English | LTR | DM Sans |
| `fr` | French | LTR | DM Sans |
| `ar` | Arabic | RTL | Noto Sans Arabic |

### RTL Implementation

- `dir="rtl"` set on `<html>` when locale is `ar`
- All CSS uses **logical properties** (ms/me/ps/pe/start/end instead of ml/mr/pl/pr/left/right)
- RTL-specific selectors: `[[dir=rtl]_&]:tracking-normal`

### Translation Structure

```
src/messages/{en,fr,ar}.json
├── metadata         -- Page titles, descriptions
├── nav              -- Navigation labels
├── hero             -- Headlines, CTAs
├── features         -- Feature cards
├── auth             -- Login, signup, validation
├── onboarding       -- Setup wizards
└── dashboard        -- Extensive nested structure
    ├── nav, assistant, notifications
    ├── company (offers, candidates, profile)
    ├── student (profile, applications, documents feedback)
    ├── explore, offerDetail (application + company report), applications
    └── admin (validations, stats, users)
```

### Critical Pattern: cacheComponents + next-intl

- Root `app/layout.tsx` must NOT call `getLocale()` -- breaks cacheComponents
- Root layout is a minimal pass-through: `return children`
- `[locale]/layout.tsx` owns `<html>/<body>` and must have `generateStaticParams()` + `setRequestLocale(locale)`

---

## 10. Design System

### Editorial Aesthetic: "Morning Press / Night Edition"

- Warm color palette (parchment backgrounds, ink foregrounds)
- Serif headlines (DM Serif Display), sans body (DM Sans)
- Generous whitespace, magazine-style layouts
- Dark mode as first-class ("Night Edition")

### Design Tokens (CSS Variables)

```css
--color-background, --color-foreground
--color-primary, --color-secondary
--color-heading (editorial headlines)
--color-muted, --color-accent
--radius-sm, --radius-md, --radius-lg
--font-sans (DM Sans), --font-serif (DM Serif), --font-arabic (Noto Sans Arabic)
```

### Animation Policy

- **Tailwind transitions**: UI state changes (hover, focus, theme)
- **motion (Framer Motion successor)**: Orchestrated reveals, staggers, marquee
- **Never**: Custom CSS `@keyframes` or global `.ed-*` utilities
- Always import from `src/lib/animations.ts` -- never define reveal/ease locally

### shadcn/ui Components (40+)

Includes: accordion, alert, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, dialog, drawer, dropdown-menu, form, input, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toggle, toggle-group, tooltip

---

## 11. AI & Assistant System

### Architecture

```
Client (useCopilot hook)
    |
    v
POST /api/assistant/chat
    |
    v
Chat Handler (auth + rate limit + intent detection)
    |
    ├── Context Minimization (strip PII, limit depth)
    ├── System Prompt (persona-based)
    ├── Tool Resolution
    │   ├── Internal Tools (9) -- generateText with structured output via AI model router
    │   └── Arcade Tools (GitHub, Gmail) -- external services
    └── AI model router (streaming via Vercel AI SDK)
    |
    v
Persistence (assistantConversation + assistantMessage)
```

### Personas

| Persona | Triggered By |
|---------|-------------|
| Stag Company Copilot | company_admin (default) |
| Stag Student Copilot | student role or student_* intents |
| Stag Admin Copilot | admin/super_admin or admin_* intents |

### Internal Tools (9)

| Tool | Role | Purpose |
|------|------|---------|
| offer_generate_draft | company_admin | Generate offer from form context |
| offer_improve_description | company_admin | Rewrite offer description |
| offer_suggest_skill_tags | company_admin | Suggest relevant skills |
| candidate_summarize | company_admin | Neutral candidate summary |
| candidate_draft_refusal_note | company_admin | Professional refusal note |
| admin_validation_summary | admin | Placement validation checklist |
| student_search_parse | student | Parse search query to filters |
| student_cover_letter_draft | student | Draft/refine cover letter |
| notifications_summarize | all roles | Summarize notification feed |

### Arcade Tools (External)

- **Providers**: GitHub, Gmail
- **Cache**: 5-minute TTL, LRU (max 100 entries)
- **Retry**: 2 attempts with exponential backoff
- **Gmail Resolver**: Auto-detects email keywords, forces Gmail tool

### Conversation Persistence

- Messages stored with `text` (quick render) + `parts` (JSONB full UI message)
- Secret redaction: auth tokens, passwords, API keys stripped before storage
- Auto-titling: fires after first user message (fire-and-forget)
- Company-scoped: all conversations belong to a company

---

## 12. Matching & Trust Systems

### Match Scoring Algorithm (v1.0.0)

**Weights**:
| Factor | Weight | Source |
|--------|--------|--------|
| Skills | 55% | Student skills vs. offer requirements |
| Language | 20% | CEFR proficiency levels |
| Location | 15% | Wilaya match + work mode |
| Profile | 10% | Completeness signals (bio, phone, github, etc.) |

**Output**: 0-100 score + detailed breakdown + missing skills + fairness notes

### Skill Gap Roadmap

Generated from match score:
- `readyPercent`: Overall match percentage
- `missingSkills`: Array of gaps
- `recommendedLearningOrder`: Skills grouped by category, largest first
- `roadmapSteps`: Actionable next steps

### Readiness History

- Daily snapshots of student readiness per offer
- Last 20 snapshots tracked for progress visualization

### Trust Index (Company Scoring)

**Formula**:
```
score = (responseRate x 0.3) + (completionRate x 0.3) + (feedbackScore x 0.3) - reportPenalty + 10
```

**Tiers**: Excellent (80+), Good (65-79), Watch (45-64), Low (<45)

**Factors**:
- Response rate: % of applications responded to
- Completion rate: % of accepted applications that reach validation
- Feedback score: Average rating (70%) + recommend rate (30%)
- Report penalty: Severity-weighted unresolved reports (max -40)

### Trust Workflow Surfaces

- **Student report submission**: Offer detail company card opens a report dialog (`companies.submitReport`)
- **Student quality feedback**: Student documents placement cards open a feedback dialog (`companies.submitQualityFeedback`)
- **Admin moderation**: Super admin stats page open reports supports resolve/dismiss actions (`companies.resolveReport`)

### Department Management

University departments with designated heads who can validate placements for their department's students. Full CRUD with bulk operations, skills management, and email-based head onboarding.

**Schema**: `department` (id, universityId, name, headName, createdAt, updatedAt), `departmentSkill` (departmentId, skillTagId)

**User fields**: `departmentId` on `user` table links dept_head users to their department.

**Services** (`src/server/services/departments/`, 10 files):
- `create.ts` — Create department under a university (duplicate name check)
- `list.ts` — List departments by university (with skill counts via SQL subquery)
- `update.ts` — Update department details (partial update, trims inputs)
- `delete.ts` — Delete department (transactional: demotes all dept_heads to student role, then deletes record)
- `assign-head.ts` — Assign dept_head role by user ID (bidirectional: updates user role/department + department headName)
- `assign-head-by-email.ts` — Assign head by email (auto-creates user if not found, triggers password reset, queues welcome email)
- `unassign-head.ts` — Remove head from department (transactional: demotes user to student, clears headName)
- `bulk-create-with-heads.ts` — Bulk create departments with heads from CSV/form (per-row error handling, partial success pattern, max 50 rows)
- `sync-skills.ts` — Sync department-specific skills (idempotent delete-then-insert, max 200 skills, validates skill IDs)
- `get-skills.ts` — Get department skill tag IDs

**oRPC** (`departments` namespace, 9 procedures):
- `list` (authedProcedureGenerous) — List departments for a university
- `create` (adminProcedureStandard) — Create department
- `update` (adminProcedureStandard) — Update department details
- `assignHead` (adminProcedureStandard) — Assign head by user ID or email (auto-creates user)
- `unassignHead` (adminProcedureStandard) — Remove department head
- `delete` (adminProcedureStandard) — Delete department
- `bulkCreateWithHeads` (adminProcedureStandard) — Bulk import departments
- `syncSkills` (adminProcedureStandard) — Sync department skills
- `getSkills` (authedProcedureGenerous) — Get department skills

**Authorization helper**: `assertCanManageDepartment()` validates role (university_admin/super_admin) and scopes non-super_admin to their own university.

`deptHead` namespace (3 placement procedures): listPending, validate, reject

**UI** (`dashboard/admin/departments/_components/DepartmentsView/`):
Feature folder with orchestrator pattern, hooks layer, and pure UI components including DeleteDepartmentDialog, RemoveHeadDialog, DepartmentSkillsModal, and BulkCreateForm sub-feature.

### Document Verification System

Public document verification using unique codes and QR codes.

**Flow**:
1. Document generated (agreement/certificate) with unique verification code
2. QR code embedded in the PDF pointing to `/verify/[code]`
3. Anyone can verify by visiting the URL or entering the code at `/verify`
4. No authentication required for verification

**Services** (`src/server/services/documents/`):
- `generate-agreement.ts`, `generate-certificate.ts` — PDF generation
- `verification-code.ts` — Unique code generation
- `qr-utils.ts` — QR code generation for documents
- `verify.ts` — Public lookup by verification code

**Schema**: `placementDocument.verificationCode` stores the unique code.

### SEO

- `src/app/robots.ts` — Dynamic robots.txt generation
- `src/app/sitemap.ts` — Dynamic sitemap generation
- `src/app/global-error.tsx` — Global error boundary

---

## 13. Infrastructure & Deployment

### Docker Production Stack

```
Internet --> Caddy :80/:443 --> Next.js App :3000
                                     |
                              PostgreSQL :5432
                              Redis :6379
             Watchtower polls GHCR every 60s
             Backup runs daily pg_dump
```

### Services

| Service | Image | Memory | Purpose |
|---------|-------|--------|---------|
| PostgreSQL | postgres:16-alpine | 384 MB | Primary database |
| Redis | redis:7-alpine | 64 MB | Rate limiting |
| Next.js App | ghcr.io/{repo}:latest | 512 MB | Application |
| Caddy | caddy:2-alpine | 64 MB | Reverse proxy + auto-HTTPS |
| Watchtower | containrrr/watchtower | 64 MB | Auto-deploy |
| Backup | postgres-backup-local | 64 MB | Daily pg_dump |

### CI/CD Pipeline

```
Push to master
    |
    v
CI (GitHub Actions):
  1. lint + typecheck
  2. test:unit (parallel with 3, 4)
  3. test:api
  4. test:pages
  5. test:coverage
  6. build
  7. test:e2e (with PostgreSQL service)
    |
    v (on success)
CD:
  1. Docker build (multi-stage)
  2. Push to ghcr.io
    |
    v (within 60s)
Watchtower:
  1. Detect new image
  2. Pull + restart container
  3. Entrypoint runs migrations
  4. App serves traffic
```

### Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

### Logging

Pino structured JSON logging with automatic redaction:
- Redacted fields: authorization, cookie, password, token, api_key, secret
- Module-scoped loggers: `createModuleLogger("email/sendEmail")`
- Configurable level via `LOG_LEVEL` env var

### Environment Variables

**Required**:
- `DATABASE_URL` -- PostgreSQL connection
- `BETTER_AUTH_SECRET` -- Auth encryption (min 32 chars)
- `NEXT_PUBLIC_BETTER_AUTH_URL` -- Base URL

**Optional but important**:
- `RESEND_API_KEY` -- Email service
- `REDIS_URL` + `REDIS_RATE_LIMIT_ENABLED` -- Rate limiting
- `AI_API_KEY` (or `POE_API_KEY` legacy fallback) -- AI provider
- `ARCADE_API_KEY` -- External tool integration
- `S3_*` -- File storage (bucket, endpoint, keys)

---

## 14. Testing Architecture

### Test Runner: Bun Test

```bash
bun test              # All tests
bun test:watch        # Watch mode
bun test:unit         # Unit/core modules (segmented to avoid mock collisions)
bun test:orpc-routes  # oRPC controller route and smoke tests
bun test:api:app-routes # App Router API route tests only
bun test:api          # API route tests + oRPC route suite
bun test:pages        # App Router page/component tests (src/app/[locale])
bun test:e2e          # Playwright E2E
bun test:coverage     # Segmented coverage reports (coverage/*.txt)
bun test:ci           # CI pipeline (unit + api + pages)
bun run check:all     # Full pre-release checks (lint, typecheck, tests, build)
```

### Test Setup (`src/test-setup.ts`)

- Happy-DOM for browser globals
- Module mocks: `server-only`, `next/cache`, `@/server/logging`, `next-intl/server`
- jest-dom matchers extended on expect
- Default env vars for test isolation

### Co-location Pattern

Test files live next to their source:
```
src/lib/utils.ts         --> src/lib/utils.test.ts
src/lib/schemas/auth.ts  --> src/lib/schemas/auth.test.ts
src/server/services/...  --> src/server/services/...test.ts
```

### E2E Testing

- Playwright with Chromium
- Auto-starts dev server
- PostgreSQL service container in CI
- Screenshots on failure, trace on first retry

---

## Appendix: Request Flow Example

**Student applies to an offer**:

1. Client calls `orpc.applications.apply.mutationOptions()` via TanStack Query
2. POST to `/api/rpc/applications.apply`
3. oRPC handler validates CSRF (Origin header)
4. Middleware chain: `authedProcedure` -> `studentProcedureStandard` (100 req/min)
5. Handler calls `applyToOffer()` service (with row-level locking)
6. Service creates application record + timeline event
7. Notification created for company members
8. Cache tags invalidated: `STUDENT_APPLICATIONS`, `STUDENT_STATS`
9. Response returned to client
10. TanStack Query invalidates local cache

---

## Appendix: Documentation Sync Policy

When adding or modifying features, **update all relevant documentation files** to keep them in sync:

| File | Purpose | What to update |
|------|---------|----------------|
| `CLAUDE.md` | Project context for Claude | Service domains, procedure counts, directory tree, patterns |
| `AGENTS.md` | Coding guidelines for AI agents | Service lists, route procedure tables, feature folder references |
| `docs/ARCHITECTURE.md` | Full system architecture | Data model, service tables, procedure counts, file counts |
| `README.md` | Project overview | High-level capabilities, architecture summary |

