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
│   │   └── (auth)/         (auth route group)
│   ├── api/                (API routes)
│   ├── layout.tsx          (root layout — fonts, html)
│   ├── globals.css
│   └── page.tsx            (redirects to /en)
├── components/             (shared UI components)
├── lib/                    (utilities, auth, validations)
├── server/                 (DB, queries, mutations)
├── i18n/                   (routing.ts, request.ts)
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

### 6. Data Fetching & Mutations (Drizzle + Type-Safe Contracts)

This project uses **Drizzle + Postgres**. The preferred architecture is **server-first** with type-safe contracts for client queries.

- **Server-only domain modules**: Put DB access in small functions (not large classes) under `src/server/<domain>/`.
  - Reads: `src/server/<domain>/queries/*.ts` (prefer `list.ts`, `get.ts`)
  - Writes: `src/server/<domain>/mutations/*.ts` (prefer `create.ts`, `update.ts`, `delete.ts`)
  - Add `import "server-only"` at the top of these modules to prevent accidental client imports.

- **Server Components (default reads)**: Server Components call `src/server/<domain>/queries/*` directly.
  - Avoid creating `/api` endpoints when the data is only needed on the server.

- **TanStack Query reads (client / infinite lists)**: Client Components (e.g. `useInfiniteQuery`) fetch from `src/app/api/*`.
  - API routes are **not type-safe by default**, so we enforce a contract with shared Zod schemas.

- **Server routers for `/app/api/*` (required)**: Keep `src/app/api/*` files as thin re-exports and put route logic in server-only router modules.
  - Location: `src/server/routers/<domain>/*.ts` (prefer `list.ts`, `get.ts`)
  - Router modules:
    - Start with `import "server-only"`
    - Parse input with Zod schemas
    - Call `src/server/<domain>/queries/*`
    - Validate output with `...ResponseSchema`
    - Return `NextResponse.json(...)`

- **Zod contracts for routes (Option 1)**: For every `src/app/api/*` endpoint, create a shared contract file:
  - `src/lib/contracts/<domain>.ts` exports:
    - `...QuerySchema` / `...BodySchema` (inputs)
    - `...ResponseSchema` (output)
    - `z.infer<>` types
  - Server router module: `parse()` input and `parse()` the JSON response payload before returning.
  - Client fetcher: `parse()` the JSON using the same `...ResponseSchema`.

- **Prefetch + hydration (recommended for infinite feeds)**:
  - Server page: `prefetchQuery/prefetchInfiniteQuery` using the server query function (Drizzle direct, no HTTP)
  - Wrap the client component with `HydrationBoundary(dehydrate(queryClient))`
  - Client hook uses the same query key and continues fetching via `/api`.

- **Mutations**:
  - Use **Server Actions** for writes.
  - Validate on the server with Zod (optionally `next-safe-action` for typed inputs/outputs).
  - After success: invalidate TanStack Query caches and (if needed) `revalidatePath/revalidateTag` for RSC freshness.

- **Client-side form validation (required)**:
  - When building frontend forms, use **TanStack Form** to validate on the client (using the same Zod schema) before calling the Server Action Or Any Form Or Mutation.
  - Server-side validation still remains mandatory.

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
├── metadata    → title, description
├── nav         → discover, forStudents, forRecruiters, about, getStarted
├── hero        → volume, headline, description1, description2, cta
├── features    → studentSpace, companyPortal, adminDashboard
├── marquee     → items[]
├── stats       → students, companies, universities, placementRate
└── language    → switcher labels
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
├── lib/validations/
│   ├── auth.ts
│   └── auth.test.ts               # Test for auth.ts
├── components/ui/
│   ├── button.tsx
│   └── button.test.tsx            # Test for button.tsx
└── server/
    └── db/queries/
        ├── list.ts
        └── list.test.ts           # Test for list.ts
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
- Validation schemas (`src/lib/validations/*.ts`)
- Business logic in server queries/mutations
- Complex component logic (custom hooks, utilities)

**Test coverage goals:**
- All exported utility functions
- All validation schemas (valid and invalid inputs)
- Server query/mutation functions
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
