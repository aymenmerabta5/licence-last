# CLAUDE.md — Project Context for Claude

This file contains project-specific knowledge and patterns for Claude to reference.

---

## Project Overview

**Internex** — A Next.js 16 + React 19 application connecting companies with university students for internships.

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Design**: Editorial "Morning Press / Night Edition" aesthetic
- **i18n**: next-intl (EN, FR, AR)

---

## Key Architectural Decisions

### 1. App Router with i18n (src/ layout)
All source code lives under `src/`. Routes are under `src/app/[locale]/` for internationalization support.

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx      (locale providers)
│   │   ├── page.tsx
│   │   ├── _components/
│   │   ├── (auth)/         (auth route group)
│   │   ├── (authenticated)/ (protected routes)
│   │   ├── onboarding/     (onboarding flows)
│   │   └── verify/         (document verification — public)
│   ├── api/
│   │   ├── auth/[...all]/  (Better Auth)
│   │   ├── rpc/[...rest]/  (oRPC catch-all, CSRF protected)
│   │   ├── assistant/      (AI assistant endpoints: chat, auth/status)
│   │   ├── openapi/        (OpenAPI spec + UI)
│   │   └── health/         (Dependency-aware readiness endpoint)
│   ├── layout.tsx          (root layout — minimal pass-through)
│   ├── globals.css
│   ├── robots.ts           (SEO robots.txt)
│   ├── sitemap.ts          (SEO sitemap)
│   ├── global-error.tsx    (global error boundary)
│   └── page.tsx            (redirects to /en)
├── components/             (shared UI components)
│   ├── ui/                 (shadcn/ui primitives)
│   ├── form-fields/        (shared form components)
│   └── [shared].tsx
├── lib/
│   ├── schemas/            (client-safe Zod schemas)
│   ├── constants/          (pipeline, internship constants)
│   ├── auth.ts             (Better Auth server config)
│   ├── auth-client.ts      (Better Auth client)
│   ├── auth-guards.ts      (RSC layout guards)
│   ├── auth-utils.ts       (auth helpers)
│   ├── date.ts             (date formatting)
│   ├── string.ts           (string utilities — slugify, etc.)
│   ├── profile-completeness.ts (student profile completion %)
│   ├── csrf.ts             (CSRF token generation)
│   ├── post-login-redirect.ts (role-based redirect)
│   └── ...
├── hooks/                  (shared hooks)
├── server/
│   ├── db/                 (Drizzle schema — 19 modules + seed)
│   ├── orpc/               (Controller — oRPC router)
│   │   ├── middleware.ts   (auth chain — 7 procedure types)
│   │   ├── rate-limited-procedures.ts (18 variants)
│   │   ├── ratelimit-middleware.ts
│   │   ├── router.ts
│   │   ├── client.ts
│   │   └── routes/         (15 route files, 88 procedures)
│   ├── services/           (Model — 16 service domains)
│   │   ├── admin/          (User management: ban, create, sessions, etc.)
│   │   ├── applications/   (Application workflow + pipeline + timeline)
│   │   ├── assistant/      (AI assistant conversations)
│   │   ├── companies/      (CRUD, approval, trust index, reports)
│   │   ├── departments/    (CRUD, delete, assign/unassign head, bulk create, skills)
│   │   ├── documents/      (PDF generation + QR + verification)
│   │   ├── matching/       (Scoring, skill gap, readiness)
│   │   ├── notifications/  (Create, list, mark read)
│   │   ├── offers/         (CRUD, search, status)
│   │   ├── placements/     (Validate, reject, list pending)
│   │   ├── skills/         (List, validate)
│   │   ├── stats/          (Admin analytics)
│   │   ├── students/       (Profile, public profile, dashboard stats)
│   │   ├── universities/   (CRUD, approve, reject)
│   │   ├── uploads/        (S3 file storage)
│   │   └── users/          (Get-me, update, promote)
│   ├── ai/                 (AI integration: model, tools, context, prompts)
│   ├── openapi/            (OpenAPI spec generation)
│   ├── pdfs/               (PDF templates: agreement, certificate)
│   ├── storage/            (Bun S3Client wrapper)
│   ├── email/              (Resend + React Email)
│   ├── caching/            (Redis client + rate limiter)
│   ├── logging/            (Pino structured logging)
│   └── mcp/                (Model Context Protocol, dev only)
├── i18n/                   (next-intl config)
├── messages/               (en.json, fr.json, ar.json)
├── env.ts                  (T3 Env validation)
└── proxy.ts                (middleware)
```

### 2. RTL Support for Arabic
The app automatically handles RTL when locale is 'ar':
- `dir="rtl"` on `<html>` element
- Arabic font: Noto Sans Arabic
- Logical CSS properties throughout

### 3. Editorial Design System
- Warm color palette (parchment, ink)
- Serif headlines (DM Serif Display)
- Sans-serif body (DM Sans / Noto Sans Arabic)
- Generous whitespace
- Asymmetrical layouts

### 4. Feature Folder Architecture (Components)

Any `_components/` client component exceeding **150 lines** must be a **feature folder** with 3 layers:

```
FeatureName/
  index.tsx              ← Orchestrator (max 120 lines): layout + wiring only
  hooks/
    useFeatureData.ts    ← All useQuery/useMutation/useInfiniteQuery
    useFeatureState.ts   ← Complex UI state (3+ useState, optional)
  components/
    SectionA.tsx         ← Pure UI, props only (max 200 lines each)
    SectionB.tsx
  types.ts
  constants.ts           ← Feature-specific only (optional)
  utils.ts               ← (optional)
```

**Layer Rules:**
- **index.tsx**: No `useQuery`, no `useMutation`, no complex JSX. Only imports hooks + components and wires them together.
- **hooks/**: All data fetching. Returns clean objects. Imports from `@/server/orpc/client`.
- **components/**: Pure UI via props. Can use `useTranslations` and `motion`.

**Shared Infrastructure** (never define locally):
- `src/lib/constants/pipeline.ts` — `STATUS_COLORS`, `STAGE_COLUMNS`, `STAGE_LABELS`
- `src/lib/constants/internship.ts` — `INTERNSHIP_TYPE_LABELS`, `INTERNSHIP_TYPE_COLORS`
- `src/lib/animations.ts` — `reveal`, `ease`, `fadeIn`, etc. (NEVER define `reveal`/`ease` locally)
- `src/hooks/useInfiniteScroll.ts` — IntersectionObserver + fetchNextPage
- `src/hooks/useDebounce.ts` — Debounced value
- `src/hooks/useLogout.ts` — Logout + redirect
- `src/hooks/useCopilot.ts` — AI chat transport + useChat + tool output parsing
- `src/hooks/useFormWithSchema.ts` — TanStack Form + Zod schema integration

**Reference implementation**: `ProfileContent/` folder under student profile `_components/`.

Use the skill `vercel-composition-patterns` and `vercel-react-best-practices` when creating components. See AGENTS.md for the full decision tree and migration mapping.

**NOTE** When a component or a custom hook used in multiple places it will be moved to the general componenets, in the root components folder

### 5. Design Pattern
Use the existing editorial design style, color palette, and shadcn/ui primitives. Use design skills for guidance.

### 6. MVC Architecture (Services + oRPC + TanStack Query)

This project uses **Drizzle + Postgres** with an **MVC architecture**:

- **Model** (`src/server/services/`) — Pure business logic functions, `import "server-only"`, no auth/framework coupling
- **Controller** (`src/server/orpc/`) — oRPC router handles ALL client-server communication with auth middleware
- **View** — React components (Server Components + Client Components)

#### Services (Model Layer)

Put pure business logic in `src/server/services/<domain>/`:
- Reads: `get.ts`, `list.ts`
- Writes: `create.ts`, `update.ts`, `approve.ts`, `reject.ts`
- Always add `import "server-only"` at the top
- Functions take plain data + userId — **never** handle auth themselves
- Throw typed `ServiceError` codes for domain failures (avoid generic `Error`)
- Return typed data — no `NextResponse`, no `ORPCError`

```typescript
// src/server/services/companies/create.ts
import "server-only"
export async function createCompany(data: {...}, userId: string) {
  // Pure DB logic, no auth
  return { companyId, slug }
}
```

#### oRPC (Controller Layer)

All client reads AND mutations go through oRPC procedures at `src/server/orpc/routes/`:

```typescript
// src/server/orpc/routes/companies.ts
import { companyAdminProcedure } from "../middleware"
import { createCompany } from "@/server/services/companies/create"

export const createCompanyProcedure = companyAdminProcedure
  .input(z.object({ name: z.string().min(2), ... }))
  .handler(async ({ input, context }) => createCompany(input, context.user.id))
```

Route handlers should map service-domain failures through `createServiceORPCError(...)` so transport errors remain consistent and route-local fallback messages are explicit.

**Middleware chain** (`src/server/orpc/middleware.ts`):
```
publicProcedure              — No auth required
├── authedProcedure          — Valid session required
│   ├── adminProcedure       — university_admin, dept_head, or super_admin
│   ├── superAdminProcedure  — super_admin only
│   ├── companyAdminProcedure — company_admin + injects companyMembership
│   ├── studentProcedure     — student role + injects studentProfile
│   └── deptHeadProcedure    — dept_head + injects departmentId + universityId
```

**Rate-Limited Procedures** (`src/server/orpc/rate-limited-procedures.ts`) — 18 variants:
```typescript
// Public (IP-based)
publicProcedureStrict              // 5 req/min (auth endpoints)
publicProcedureStandard            // 100 req/min (public reads)

// Authenticated (user-based)
authedProcedureStandard            // 100 req/min (general API)
authedProcedureGenerous            // 300 req/min (listings, searches)
authedProcedureStrict              // 5 req/min (sensitive ops)

// Admin (university_admin/dept_head/super_admin)
adminProcedureStandard             // 100 req/min (standard admin ops)
adminProcedureGenerous             // 300 req/min (bulk admin ops)

// Super Admin (super_admin only)
superAdminProcedureStandard        // 100 req/min (standard super admin)
superAdminProcedureGenerous        // 300 req/min (bulk super admin)

// Department Head (dept_head)
deptHeadProcedureStandard          // 100 req/min (dept head ops)
deptHeadProcedureGenerous          // 300 req/min (dept head reads)

// Company Admin (company_admin)
companyAdminProcedureStandard      // 100 req/min (general company ops)
companyAdminProcedureGenerous      // 300 req/min (read-heavy company ops)
companyAdminProcedureAssistant     // 20 req/min (company AI calls)

// Student (student)
studentProcedureStandard           // 100 req/min (general student ops)
studentProcedureGenerous           // 300 req/min (student read-heavy)

// AI
assistantProcedureLimited          // 20 req/min (AI calls)
```

#### Client Usage

```typescript
// Direct call (forms, one-off mutations)
import { orpcClient } from "@/server/orpc/client"
const me = await orpcClient.users.getMe()

// TanStack Query (reactive data)
import { orpc } from "@/server/orpc/client"
const { data } = useQuery(orpc.companies.list.queryOptions({ input: { status: "approved" } }))
const { mutateAsync } = useMutation(orpc.companies.create.mutationOptions())
```

#### Server Components (RSC)

Server Components call services **directly** — no oRPC needed:
```typescript
import { getCompanyByUserId } from "@/server/services/companies/get"
const company = await getCompanyByUserId(session.user.id)
```

#### Shared Schemas

Client-safe Zod schemas live in `src/lib/schemas/` (NO `server-only`):
- `auth.ts` — login, signup, reset password schemas
- `company.ts` — company onboarding and profile schemas
- `student.ts` — student profile (education, experience, skills)
- `offer.ts` — internship offer creation schemas
- `search.ts` — search and filter schemas
- `matching.ts` — matching criteria schemas
- `university.ts` — university CRUD schemas
- `verify.ts` — document verification code schema
- `enums.ts` — shared enum schemas
- `map-errors.ts` — Zod error mapping utilities

Used by both TanStack Form (client validation) and oRPC procedures (server validation).

#### Client-side form validation (required)

When building frontend forms, use **TanStack Form** to validate on the client (using schemas from `src/lib/schemas/`) before calling oRPC mutations.
Server-side validation via oRPC `.input()` still remains mandatory.

---

## RTL & Logical CSS Properties (CRITICAL)

When writing Tailwind classes for RTL support, **ALWAYS use logical properties**:

### Spacing
```tsx
// ✅ CORRECT - works for LTR and RTL
<div className="ms-4 me-6 ps-2 pe-4">

// ❌ WRONG - breaks in RTL
<div className="ml-4 mr-6 pl-2 pr-4">
```

### Text Alignment
```tsx
// ✅ CORRECT
<p className="text-start"> or <p className="text-end">

// ❌ WRONG
<p className="text-left"> or <p className="text-right">
```

### Borders
```tsx
// ✅ CORRECT
<div className="border-s border-e rounded-s rounded-e">

// ❌ WRONG
<div className="border-l border-r rounded-l rounded-r">
```

### Positioning
```tsx
// ✅ CORRECT
<div className="start-0 end-0 inset-inline-start-4">

// ❌ WRONG
<div className="left-0 right-0 left-4">
```

---

## Translation Patterns

### Server Components
```typescript
import { getTranslations } from "next-intl/server"

export default async function Page() {
  const t = await getTranslations("namespace")
  return <h1>{t("key.subkey")}</h1>
}
```

### Client Components
```typescript
"use client"
import { useTranslations } from "next-intl"

export function Component() {
  const t = useTranslations("namespace")
  return <h1>{t("key.subkey")}</h1>
}
```

### Translation Structure
```
src/messages/
├── metadata         → page titles, descriptions
├── nav              → navigation labels
├── hero             → headlines, CTAs
├── features         → feature cards
├── marquee          → scrolling items
├── stats            → statistics labels
├── language         → language switcher
├── theme            → theme toggle
├── notFound         → 404 page
├── auth             → login, signup, reset-password, validation
├── onboarding       → company, student setup
└── dashboard        → extensive nested structure
    ├── nav          → sidebar navigation
    ├── assistant    → AI assistant interface
    ├── notifications → notification center
    ├── company      → offers, candidates, profile
    ├── student      → profile, applications
    ├── explore      → internship search
    ├── offerDetail  → application flow
    ├── applications → tracking
    └── admin        → validations, stats
```

---

## Common Patterns

### Language Switcher
```typescript
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

// Always include in Navbar, next to ThemeToggle
<div className="flex items-center gap-3">
  <LanguageSwitcher />
  <ThemeToggle />
</div>
```

### Navigation with Locale
```typescript
import { usePathname, useRouter } from "@/i18n/routing"

const router = useRouter()
const pathname = usePathname()

// Change locale
router.replace(pathname, { locale: "ar" })
```

### Detecting RTL
```typescript
import { useLocale } from "next-intl"

const locale = useLocale()
const isRTL = locale === "ar"
```

---

## File Conventions

- **Components**: PascalCase (`HeroSection.tsx`)
- **Utilities**: camelCase (`utils.ts`)
- **Constants**: UPPER_SNAKE_CASE
- **Imports**: Always use `@/` aliases (resolves to `src/*` via tsconfig paths)
- **CSS**: Use logical properties for RTL
- **Source code**: All source lives under `src/`; config files at project root

---

## Design Tokens

Access via CSS variables:
- `--color-background`, `--color-foreground`
- `--color-primary`, `--color-secondary`
- `--font-sans`, `--font-serif`, `--font-arabic`

Animation policy:
- Use Tailwind transitions for UI/state changes
- Use `motion` (`motion/react-client`) for all animations (reveals, staggers, marquee)
- Avoid custom CSS `@keyframes` and avoid global `.ed-*` utilities in `src/app/globals.css`

---

## Build Commands

```bash
bun run dev        # Development
bun run build      # Production build
bun run start      # Production start
bun run lint       # ESLint
bun run typecheck  # TypeScript check

# Testing
bun test           # Run all tests
bun test:watch     # Watch mode
bun test:coverage  # Coverage report
bun test:unit      # Unit/core modules (segmented to avoid mock collisions)
bun test:orpc-routes # oRPC controller route + smoke tests
bun test:api       # API route tests + oRPC route suite
bun test:pages     # App Router page/component tests (src/app/[locale])
bun test:e2e       # Playwright E2E tests
bun test:ci        # CI pipeline (unit + api + pages)

# Database
bun run db:generate    # Generate Drizzle migrations (dev)
bun run db:migrate     # Run migrations (dev)
bun run db:push        # Push schema changes (dev)
bun run db:studio      # Open Drizzle Studio (dev)
bun run db:seed        # Seed database (dev)
bun run db:reset       # Reset database (dev)
# Append :prod for production variants (e.g., db:migrate:prod)
```

---

## Testing Architecture (Bun Test Runner)

This project uses **Bun's built-in test runner** (`bun:test`) for unit testing. Tests are co-located next to the source files they test.

### Test File Location (Co-location Pattern)

Place test files **next to the source files** they test:

```
src/
├── lib/
│   ├── utils.ts
│   └── utils.test.ts              # Test for utils.ts
├── lib/schemas/
│   ├── auth.ts
│   └── auth.test.ts               # Test for auth.ts
├── components/ui/
│   ├── button.tsx
│   └── button.test.tsx            # Test for button.tsx
└── server/
    └── services/companies/
        ├── create.ts
        └── create.test.ts         # Test for create.ts
```

**Why co-location:**
- Easy to find tests when working on a file
- Clear visibility of what's tested
- Moving/deleting files keeps tests in sync
- Follows the project's domain-organized pattern

### Writing Tests

Import test utilities from `bun:test`:

```typescript
import { describe, test, expect } from "bun:test"
import { myFunction } from "./my-module"

describe("myModule", () => {
  test("should do something correctly", () => {
    const result = myFunction("input")
    expect(result).toBe("expected output")
  })

  test("should handle edge cases", () => {
    expect(() => myFunction(null)).toThrow()
  })
})
```

### What to Test

**Must test:**
- Utility functions (`src/lib/utils.ts`)
- Schemas (`src/lib/schemas/*.ts`)
- Service functions (`src/server/services/**/*.ts`)
- Complex component logic (custom hooks, utilities)

**Test coverage goals:**
- All exported utility functions
- All validation schemas (valid and invalid inputs)
- Service functions (business logic)
- Edge cases and error handling

### Test Commands

```bash
bun test                    # Run all tests once
bun test:watch             # Watch mode - re-run on file changes
bun test:coverage          # Run with coverage report
bun test:unit              # Unit/core modules (segmented to avoid mock collisions)
bun test:orpc-routes       # oRPC controller route + smoke tests
bun test:api               # API endpoint tests + oRPC route suite
bun test:pages             # App Router page/component tests (src/app/[locale])
bun test:e2e               # Playwright end-to-end tests
bun test:ci                # CI pipeline (unit + api + pages)
bun test src/lib/utils.test.ts  # Run specific test file
bun test --test-name-pattern="should handle"  # Run matching tests
```

### Best Practices

1. **Use descriptive test names** - "should [expected behavior] when [condition]"
2. **Group related tests** with `describe()` blocks
3. **Test both success and failure cases**
4. **Avoid testing implementation details** - test behavior, not internals
5. **Keep tests fast** - avoid real network calls, use mocks when needed
6. **Use type annotations when needed** to prevent TypeScript errors:
   ```typescript
   const variant: string = "primary"  // Prevents literal type inference
   ```

### Example Test Patterns

**Utility function test:**
```typescript
describe("cn utility", () => {
  test("merges tailwind classes correctly", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
  })
})
```

**Validation schema test:**
```typescript
describe("login schema", () => {
  const schema = createLoginSchema(mockT)

  test("accepts valid email and password", () => {
    const result = schema.safeParse({
      email: "user@example.com",
      password: "password123"
    })
    expect(result.success).toBe(true)
  })

  test("rejects invalid email", () => {
    const result = schema.safeParse({
      email: "not-an-email",
      password: "password123"
    })
    expect(result.success).toBe(false)
  })
})
```

---

## Environment Variables

Validated via T3 Env (`src/env.ts`). See `.env.example` for defaults.

**Required:**
- `DATABASE_URL` — PostgreSQL connection string
- `BETTER_AUTH_SECRET` — Auth secret (min 32 chars)
- `NEXT_PUBLIC_BETTER_AUTH_URL` — Public app URL (e.g., `https://internex.example.com`)

**Optional — AI:**
- `POE_API_KEY`, `POE_MODEL`, `POE_BASE_URL`, `POE_ALLOWED_MODELS` — AI provider
- `ARCADE_API_KEY` — External tools (GitHub, Gmail)

**Optional — Email:**
- `RESEND_API_KEY` — Resend email service
- `EMAIL_FROM` — Sender address

**Optional — Storage (S3):**
- `S3_BUCKET`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION`
- `S3_PUBLIC_URL`, `S3_BUCKET_NAME`, `NEXT_PUBLIC_S3_ENDPOINT`, `NEXT_PUBLIC_S3_URL`

**Optional — Redis:**
- `REDIS_URL` — Redis connection string
- `REDIS_RATE_LIMIT_ENABLED` — Enable rate limiting (`"true"` / `"false"`)

**Optional — Logging:**
- `LOG_LEVEL` — Pino level: `fatal | error | warn | info | debug | trace | silent` (default: `info`)

---

## Additional Server Architecture

### Rate Limiting

Redis-based rate limiting with graceful fallback when Redis is unavailable:

**`src/server/caching/redis-ratelimiter.ts`:**
```typescript
export function getRateLimiter(): RedisRatelimiter | null
export function isRateLimitingEnabled(): boolean
```

### MCP (Model Context Protocol)

Development-only MCP server for AI tool testing at `src/server/mcp/`:
- Guards for environment safety checks
- Confirmation flows for sensitive operations
- Mock ledger system for testing

**Run:** `bun run mcp:dev`

### File Storage (S3)

**`src/server/storage/s3.ts`** (uses Bun's native `Bun.S3Client`):
```typescript
export async function uploadFile(key: string, data: Buffer, contentType: string): Promise<string>
export async function deleteFile(key: string): Promise<void>
export function isConfigured(): boolean
```
Supports AWS S3, Cloudflare R2, or any S3-compatible endpoint.

### Structured Logging

**`src/server/logging/logger.ts`** (Pino):
```typescript
export const logger: pino.Logger
export function createLogger(bindings: Record<string, unknown>): pino.Logger
export function createModuleLogger(module: string): pino.Logger
```
Auto-redacts sensitive fields. Configurable via `LOG_LEVEL` env var.

### Email System

**`src/server/email/sendEmail.ts`** uses React Email + Resend:
```typescript
// 4 positional args — NOT an object!
export async function sendEmail<T>(
  to: string | string[],
  subject: string,
  EmailComponent: React.ComponentType<T>,
  componentProps: T,
  options?: { from?: string; replyTo?: string; cc?: string[]; bcc?: string[] }
): Promise<{ success: boolean }>
```

### Document Generation & Verification

PDF generation using `@react-pdf/renderer`:
- Internship agreements (`src/server/pdfs/AgreementTemplate.tsx`)
- Completion certificates (`src/server/pdfs/CertificateTemplate.tsx`)
- Each document gets a unique **verification code** + QR code
- Public verification page at `/verify` and `/verify/[code]`
- Services: `generate-agreement.ts`, `generate-certificate.ts`, `qr-utils.ts`, `verification-code.ts`, `verify.ts`

### Department Management

**`src/server/services/departments/` (10 files):**
- `create.ts` — Create department under a university (duplicate name check)
- `list.ts` — List departments by university (with skill counts)
- `update.ts` — Update department details (partial update)
- `delete.ts` — Delete department (transactional: demotes dept_heads to student, then deletes)
- `assign-head.ts` — Assign dept_head role by user ID (bidirectional user + department update)
- `assign-head-by-email.ts` — Assign head by email (auto-creates user if needed, triggers password reset)
- `unassign-head.ts` — Remove head from department (transactional: demotes role, clears headName)
- `bulk-create-with-heads.ts` — Bulk create departments with heads from CSV (per-row error handling, partial success)
- `sync-skills.ts` — Sync department-specific skills (delete-then-insert, max 200)
- `get-skills.ts` — Get department skill IDs

**oRPC**: `departments` namespace (9 procedures) + `deptHead` namespace (3 placement procedures)

### OpenAPI

- **`src/server/openapi/generator.ts`** — Generates OpenAPI spec from oRPC router
- **API routes**: `/api/openapi/spec` (JSON spec), `/api/openapi` (Swagger UI)

### AI/Assistant Features

**Architecture:**
- **Model provider**: Poe (OpenAI-compatible) via `@ai-sdk/openai`
- **External tools**: Arcade (GitHub, Gmail integration)
- **Config**: `src/server/ai/` (model, tools, context, prompts)
- **Services**: `src/server/services/assistant/` (conversations, messages)
- **API routes**: `src/app/api/assistant/chat/`, `src/app/api/assistant/auth/status/`
- **Rate limited**: `assistantProcedureLimited` (20 req/min)

**3 Personas** (role-based context injection):
- Student persona — application guidance, offer discovery
- Company admin persona — candidate screening, offer management
- Admin persona — platform management

**9 Internal Tools**: get-offers, get-applications, get-matching-scores, get-company-info, get-student-info, search-internships, get-stats, get-notifications, get-documents

**Env vars**: `POE_API_KEY`, `POE_MODEL`, `POE_BASE_URL`, `ARCADE_API_KEY`

### Matching & Trust Systems

**Matching** (`src/server/services/matching/`):
- Student-offer match scoring: Skills 55% + Language 20% + Location 15% + Profile 10%
- Skill gap analysis with recommendations
- Readiness history tracking over time

**Trust** (`src/server/services/companies/trust-index.ts`):
- Formula: `responseRate + completionRate + feedbackScore - reportPenalties`
- Company trust reports and feedback aggregation

### SEO

- `src/app/robots.ts` — Dynamic robots.txt generation
- `src/app/sitemap.ts` — Dynamic sitemap generation
- `src/app/global-error.tsx` — Global error boundary

### User Roles (5 total)

| Role | Description |
|------|-------------|
| `student` | University-affiliated user — browse offers, apply, track applications |
| `company_admin` | Company recruiter — create offers, manage pipeline, AI assistant |
| `dept_head` | Department head — validate placements for their department |
| `university_admin` | University administrator — validate placements, view stats |
| `super_admin` | Platform operator — full control: users, companies, universities |

**Note**: The old `admin` role was renamed to `university_admin`. The `adminProcedure` middleware now accepts `university_admin`, `dept_head`, or `super_admin`.

---

## Documentation Sync Policy

When adding or modifying features (services, procedures, components, translations), **update all relevant documentation files**:

| File | Purpose | What to update |
|------|---------|----------------|
| `CLAUDE.md` | Project context for Claude | Service domains, procedure counts, directory tree, patterns |
| `AGENTS.md` | Coding guidelines for AI agents | Service lists, route procedure tables, feature folder references |
| `docs/ARCHITECTURE.md` | Full system architecture | Data model, service tables, procedure counts, file counts |
| `README.md` | Project overview | High-level capabilities, architecture summary |

**Checklist for new features:**
1. Add new service files to the relevant domain in all docs
2. Update procedure counts (total and per-namespace)
3. Update file counts in service domain tables
4. Add new UI components to feature folder references if applicable
5. Add translation keys to the translation structure if new namespaces
