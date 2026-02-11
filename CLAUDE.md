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
│   │   └── onboarding/     (onboarding flows)
│   ├── api/
│   │   ├── auth/[...all]/  (Better Auth)
│   │   ├── rpc/[...rest]/  (oRPC catch-all)
│   │   └── assistant/      (AI assistant endpoints)
│   ├── layout.tsx          (root layout — fonts, html)
│   ├── globals.css
│   └── page.tsx            (redirects to /en)
├── components/             (shared UI components)
│   ├── ui/                 (shadcn/ui primitives)
│   ├── form-fields/        (shared form components)
│   └── [shared].tsx
├── lib/
│   ├── schemas/            (client-safe Zod schemas)
│   ├── auth.ts             (Better Auth server config)
│   ├── auth-client.ts      (Better Auth client)
│   └── auth-guards.ts      (RSC layout guards)
├── hooks/                  (shared hooks)
├── server/
│   ├── db/                 (Drizzle schema + seed)
│   ├── orpc/               (Controller — oRPC router)
│   │   ├── middleware.ts   (auth chain)
│   │   ├── rate-limited-procedures.ts
│   │   ├── router.ts
│   │   ├── client.ts
│   │   └── routes/         (12 route files)
│   ├── services/           (Model — 17 service domains)
│   │   ├── ai/             (AI integration)
│   │   ├── applications/
│   │   ├── assistant/      (AI assistant)
│   │   ├── companies/
│   │   ├── documents/      (PDF generation)
│   │   ├── matching/       (Student-offer matching)
│   │   ├── notifications/
│   │   ├── offers/
│   │   ├── placements/
│   │   ├── students/
│   │   ├── uploads/        (S3 file storage)
│   │   └── users/
│   ├── actions/            (Server Actions)
│   ├── storage/            (S3 client)
│   ├── email/              (Email service)
│   ├── caching/            (Redis caching)
│   └── mcp/                (Model Context Protocol)
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

### 4. Components Pattern
For that you should use the skill 'vercel-composition-patterns' and 'vercel-react-best-practices' whenever you will create a component

### 5. Design Pattern
You should use the existing design style and the color palette and you should use the basic shadcn components to do that, you should use the design skills to help you desgin better

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

**Middleware chain** (`src/server/orpc/middleware.ts`):
```
publicProcedure              — No auth required
├── authedProcedure          — Valid session required
│   ├── adminProcedure       — admin or super_admin role
│   ├── superAdminProcedure  — super_admin only
│   ├── companyAdminProcedure — company_admin + injects companyMembership
│   └── studentProcedure     — student role + injects studentProfile
```

**Rate-Limited Procedures** (`src/server/orpc/rate-limited-procedures.ts`):
```typescript
publicProcedureStrict        // 5 req/min (auth endpoints)
publicProcedureStandard      // 100 req/min (public reads)
authedProcedureStandard      // 100 req/min (general API)
authedProcedureGenerous      // 300 req/min (listings, searches)
authedProcedureStrict        // 5 req/min (sensitive ops)
adminProcedureGenerous       // 300 req/min (bulk admin ops)
assistantProcedureLimited    // 20 req/min (AI calls)
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
bun run dev      # Development
bun run build    # Production build
bun run lint     # ESLint
bun run typecheck # TypeScript check
bun test         # Run all tests
bun test:watch   # Run tests in watch mode
bun test:coverage # Run tests with coverage report
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

**`src/server/storage/s3.ts`:**
```typescript
export async function uploadFile(key, data, contentType): Promise<string>
export async function deleteFile(key): Promise<void>
```

### Email System

**`src/server/email/sendEmail.ts`** uses React Email + Resend:
```typescript
export async function sendEmail({ to, subject, react }): Promise<void>
```

### Document Generation

PDF generation using `@react-pdf/renderer`:
- Internship agreements
- Completion certificates

### AI/Assistant Features

**Services:** `src/server/services/assistant/`
- AI-powered chat interface
- Tool calling with authorization
- Conversation persistence
- Rate limited via `assistantProcedureLimited`

### Matching & Trust Systems

**Matching** (`src/server/services/matching/`):
- Student-offer match scores
- Skill gap analysis
- Readiness history tracking

**Trust** (`src/server/services/companies/trust-index.ts`):
- Company trust scores
- Trust reports and feedback
