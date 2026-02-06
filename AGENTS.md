# AGENTS.md — Coding Guidelines for AI Agents

> Last updated: 2026-02-06  
> Project: Internex — A Next.js 16 + React 19 application with editorial design aesthetic, for linking companies internship programs with university students

---

## Build & Development Commands

```bash
# Development server
bun run dev

# Production build
bun run build

# Production server (after build)
bun run start

# Linting (ESLint with Next.js config)
bun run lint

# Testing
bun test              # Run all tests
bun test:watch        # Watch mode
bun test:coverage     # With coverage report
```

**Note:** This project uses Bun as the package manager (`bun.lock` present).

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| React | 19.2.3 |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 4 + `@theme inline` |
| UI Components | shadcn/ui (base-nova style) |
| Animation | motion (Framer Motion successor) |
| Icons | lucide-react |
| Fonts | DM Sans, DM Serif Display (Google Fonts) |
| Testing | Bun Test Runner (built-in) |

---

## Data Access, Fetching & Mutations (Next.js 16)

This project uses **Postgres + Drizzle** (`src/server/db/*`). Prefer a **server-first** architecture, and use shared Zod contracts to make `/app/api/*` routes effectively type-safe.

### Server-Only Data Modules (Required)

- Put all DB access in small domain functions (avoid big OOP service classes).
- Location:
  - Reads: `src/server/<domain>/queries/*.ts` (prefer `list.ts`, `get.ts`)
  - Writes: `src/server/<domain>/mutations/*.ts` (prefer `create.ts`, `update.ts`, `delete.ts`)
- Add `import "server-only"` at the top of these files.
- Import `db` from `@/server/db` and schema from `@/server/db/schema`.

### Fetching (Reads)

- **Server Components (default)**: Call `src/server/<domain>/queries/*` directly from `src/app/[locale]/**/page.tsx` and other Server Components.
- **Client Components (TanStack Query)**: Use `/app/api/*` for client reads, especially for `useInfiniteQuery`.
  - Keep `src/app/api/*` thin (re-export from `src/server/routers/**`); routers call the server query function and return JSON.

### Server Routers for `/app/api/*` (Required)

Keep all route handler logic in **server-only router modules**, and keep `src/app/api/*` files as thin re-exports.

- Location: `src/server/routers/<domain>/*.ts` (prefer `list.ts`, `get.ts`)
  - Example mapping:
    - `src/app/api/internships/route.ts` exports `GET` from `src/server/routers/internships/list.ts`
    - `src/app/api/internships/[id]/route.ts` exports `GET` from `src/server/routers/internships/get.ts`
- Router modules:
  - Start with `import "server-only"`
  - Parse input with Zod contract schemas
  - Call `src/server/<domain>/queries/*`
  - Parse/validate output with `...ResponseSchema`
  - Return `NextResponse.json(...)`

### Type-Safe Route Handlers (Option 1 - Required For /api)

Because `app/api/*` is not type-safe by default, enforce a shared contract:

- Create `src/lib/contracts/<domain>.ts` with Zod schemas and inferred types:
  - Input schema(s): `...QuerySchema` for `searchParams`, `...BodySchema` for JSON bodies
  - Output schema: `...ResponseSchema`
- In the server router module (e.g. `src/server/routers/<domain>/list.ts` / `src/server/routers/<domain>/get.ts`):
  - `parse()` the incoming params/body with the input schema
  - `parse()` the output payload with the response schema before returning
- In the Next route file (`src/app/api/**/route.ts`):
  - Re-export the handler from `src/server/routers/**` (keep it thin)
- In the client fetcher (e.g. `src/lib/api/<domain>.ts`):
  - `parse()` the response JSON with the same `...ResponseSchema`

### React Query Prefetch + Hydration (Recommended)

- For client-heavy pages (feeds, infinite lists), prefetch on the server with a `QueryClient` and hydrate:
  - Server page: `prefetchQuery/prefetchInfiniteQuery` using the server query function (Drizzle direct; no HTTP)
  - Render: `<HydrationBoundary state={dehydrate(queryClient)}>` around the client component
  - Client: `useQuery/useInfiniteQuery` continues fetching via `/api` using the same query key

### Mutations (Writes)

- Use **Server Actions** for creates/updates/deletes.
  - Validate on the server with Zod (optionally use `next-safe-action` for typed results and consistent errors).
- After a successful mutation:
  - Invalidate TanStack Query caches (`queryClient.invalidateQueries({ queryKey: ... })`)
  - If the mutated data also appears in Server Components with Next caching, use `revalidatePath` / `revalidateTag` as needed

### Frontend Form Validation (Required)

- When building form-based UI, use **TanStack Form** to validate in the client before executing the Server Action or Any Form Or Mutation.
- Use the same Zod schema for client validation and server validation.
- Client validation improves UX; server validation remains mandatory.

---

## Code Style Guidelines

### Imports & Path Aliases

- **Always use `@/` aliases** — never relative imports:
  - `@/components/ui/button`
  - `@/lib/utils`
  - `@/app/_components/HeroSection`

- **Import order** (separate groups with blank line):
  1. React/Next built-ins
  2. Third-party libraries
  3. `@/` aliases (components, lib, hooks)
  4. Local styles

```typescript
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import { ThemeProvider } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import "./globals.css"
```

### TypeScript Conventions

- Use `type` for type imports: `import type { Metadata }`
- Props interfaces use descriptive names:
  ```typescript
  interface ButtonProps extends VariantProps<typeof buttonVariants> {
    className?: string
  }
  ```
- Prefer `interface` over `type` for object shapes
- Use `React.ReactNode` for children
- Strict mode enabled — no implicit any

### Naming Conventions

- **Components**: PascalCase (`HeroSection`, `ThemeToggle`)
- **Files**: PascalCase for components, camelCase for utilities
- **Constants**: UPPER_SNAKE_CASE for module-level constants
  ```typescript
  const NAV_ITEMS = ["Discover", "For Students", "For Recruiters", "About"]
  ```
- **Variants**: Use `cva` (class-variance-authority) with descriptive variant names
- **Hooks**: camelCase starting with `use` (if any custom hooks added)

### Component Structure

```typescript
"use client" // If needed (must be first line)

import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// 1. Variant definitions
const componentVariants = cva("base classes", {
  variants: {
    variant: { /* ... */ },
    size: { /* ... */ },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

// 2. Component function
function ComponentName({
  className,
  variant = "default",
  size = "default",
  ...props
}: ComponentPrimitive.Props & VariantProps<typeof componentVariants>) {
  return (
    <ComponentPrimitive
      data-slot="component-name"
      className={cn(componentVariants({ variant, size, className }))}
      {...props}
    />
  )
}

// 3. Exports
export { ComponentName, componentVariants }
```

### Tailwind CSS Conventions

- **Use `@theme inline`** — all design tokens defined in `globals.css` as CSS variables
- **Color tokens** (use these, not hardcoded values):
  - `--color-background`, `--color-foreground`
  - `--color-primary`, `--color-secondary`
  - `--color-heading` (for editorial headlines)
  - `--color-muted`, `--color-accent`
- **Radius tokens**: `--radius-sm`, `--radius-md`, `--radius-lg`, etc.
- **Typography**: `--font-sans` (DM Sans), `--font-serif` (DM Serif)

- **Utility classes** via `cn()` from `@/lib/utils`:
  ```typescript
  className={cn(buttonVariants({ variant, size, className }))}
  ```

### Editorial Design System

This project follows a "Morning Press / Night Edition" editorial aesthetic:

- **Warm color palette**: Parchment backgrounds, ink foregrounds
- **Typography**: Serif for headlines (`font-serif`), sans for body (`font-sans`)
- **Spacing**: Generous whitespace, editorial magazine feel
- **Custom utilities** (defined in `globals.css`):
  - `.ed-smooth` — smooth theme transitions
  - `.ed-underline` — animated underline effect
  - `.ed-marquee` — continuous scroll animation
  - `.ed-hero-glow` — ambient background glow (dark mode)

### File Organization

All source code lives under the `src/` directory. Configuration files stay at root.

```
src/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Root redirect → /en
│   ├── layout.tsx              # Root layout (fonts, html)
│   ├── globals.css             # Global styles + theme variables
│   ├── [locale]/               # i18n routes
│   │   ├── layout.tsx          # Locale layout (providers)
│   │   ├── page.tsx            # Home page
│   │   ├── _components/        # Route-specific components
│   │   └── (auth)/             # Auth route group
│   │       ├── layout.tsx
│   │       ├── login/
│   │       ├── signup/
│   │       └── reset-password/
│   └── api/                    # API routes
│       └── auth/[...all]/
├── components/                 # Shared components
│   ├── ui/                     # shadcn/ui components (auto-generated)
│   │   ├── button.tsx
│   │   └── card.tsx
│   ├── providers/              # Context providers
│   │   └── QueryProvider.tsx
│   ├── Navbar.tsx
│   ├── ThemeToggle.tsx
│   └── LanguageSwitcher.tsx
├── lib/                        # Utilities & shared logic
│   ├── utils.ts                # cn() utility
│   ├── utils.test.ts           # Tests for utils.ts
│   ├── auth.ts                 # Better Auth server config
│   ├── auth-client.ts          # Better Auth client
│   ├── safe-action.ts          # next-safe-action clients
│   └── validations/            # Zod schemas
│       ├── auth.ts
│       └── auth.test.ts        # Tests for auth.ts
├── server/                     # Server-only code (DB, routers)
│   └── db/
│       ├── index.ts            # Drizzle client
│       └── schema/
│           └── auth.ts
├── i18n/                       # next-intl configuration
│   ├── routing.ts
│   └── request.ts
├── messages/                   # Translation JSON files
│   ├── en.json
│   ├── fr.json
│   └── ar.json
├── env.ts                      # T3 Env validation
└── proxy.ts                    # Next.js middleware (i18n + auth)

public/                         # Static assets (root level)
```

### Error Handling

- Use early returns for guard clauses
- Prefer explicit error types over `any`
- Client components: Handle loading/error states with UI feedback
- Server components: Let errors bubble to error boundaries

### Accessibility

- Always include `aria-label` on interactive elements without visible text
- Use semantic HTML (`nav`, `main`, `article`)
- Support `prefers-reduced-motion` (already handled in globals.css)
- Ensure proper color contrast (design system maintains WCAG compliance)

### Components Pattern
For that you should use the skill 'vercel-composition-patterns' and 'vercel-react-best-practices' whenever you will create a component

### Design Pattern
You should use the existing design style and the color palette and you should use the basic shadcn components to do that, you should use the design skills to help you desgin better


---

## Linting

This project uses ESLint with Next.js core-web-vitals and TypeScript configs:

```javascript
// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
```

Run `bun run lint` before committing. No custom rules — follow Next.js defaults.

---

## Testing (Unit Tests with Bun)

This project uses **Bun's built-in test runner** (`bun:test`) - no Jest or Vitest needed.

### Test File Structure (Co-location)

Always place tests **next to the source file** they test:

```typescript
// src/lib/utils.ts
export function cn(...inputs: ClassValue[]) { ... }

// src/lib/utils.test.ts
import { describe, test, expect } from "bun:test"
import { cn } from "./utils"

describe("cn utility", () => {
  test("merges classes correctly", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
  })
})
```

**Required locations for tests:**
- `src/lib/*.test.ts` - Utility functions
- `src/lib/validations/*.test.ts` - Zod schemas and validation logic
- `src/server/*/queries/*.test.ts` - Database query functions
- `src/server/*/mutations/*.test.ts` - Database mutation functions
- `src/components/ui/*.test.tsx` - UI components (when logic is complex)

### When to Write Tests

**Always write tests for:**
1. ✅ Utility functions in `src/lib/utils.ts`
2. ✅ All validation schemas in `src/lib/validations/`
3. ✅ Server-side business logic (queries/mutations)
4. ✅ Complex helper functions with branching logic

**Example scenarios requiring tests:**
- Form validation schemas (test valid inputs, invalid inputs, edge cases)
- Data transformation utilities
- Business logic with conditional branches
- Helper functions that manipulate data

### Test Commands

```bash
bun test              # Run all tests
bun test:watch        # Watch mode for development
bun test:coverage     # Generate coverage report
```

### Writing Test Files

**Naming:** Use `<source-file>.test.ts` pattern

**Structure:**
```typescript
import { describe, test, expect } from "bun:test"
import { functionToTest } from "./source-file"

describe("functionName", () => {
  describe("feature/context", () => {
    test("should [expected behavior] when [condition]", () => {
      // Arrange
      const input = ...
      
      // Act
      const result = functionToTest(input)
      
      // Assert
      expect(result).toBe(expected)
    })
  })
})
```

**Key guidelines:**
- Use `describe()` to group related tests
- Test names should read like "should [expected behavior] when [condition]"
- Test both happy paths and error cases
- Mock external dependencies (DB, API calls) when needed
- Use explicit type annotations if TypeScript complains about literal types

### TypeScript Configuration

Tests use Bun's types. The `tsconfig.json` includes:
```json
"types": ["bun-types"]
```

This allows importing from `bun:test` without type errors.

---

## Design Philosophy

This codebase prioritizes **editorial elegance** over generic UI:

- **Warm, human aesthetic** — not cold corporate design
- **Intentional asymmetry** — magazine-style layouts
- **Smooth, purposeful motion** — animations that enhance, not distract
- **Typography-driven hierarchy** — serif headlines, clean body text
- **Dark mode as first-class** — "Night Edition" theme is equally refined

When adding features, maintain this editorial voice. Avoid generic component libraries unless they fit the warm, refined aesthetic.

---

## Internationalization (i18n) with next-intl

This project supports **three languages**: English (en), French (fr), and Arabic (ar). All components must be i18n-ready.

### Setup
- **Configuration**: `src/i18n/routing.ts`, `src/i18n/request.ts`
- **Messages**: `src/messages/{en,fr,ar}.json`
- **Middleware**: `src/proxy.ts` (next-intl routing + protected routes)
- **Routing**: All pages under `src/app/[locale]/`

### Server Components
```typescript
import { getTranslations } from "next-intl/server"

export default async function Page() {
  const t = await getTranslations("namespace")
  return <h1>{t("key")}</h1>
}
```

### Client Components
```typescript
"use client"
import { useTranslations } from "next-intl"

export function Component() {
  const t = useTranslations("namespace")
  return <h1>{t("key")}</h1>
}
```

### RTL (Right-to-Left) Support for Arabic

**CRITICAL**: When styling components that support RTL languages (Arabic), **always use logical CSS properties** instead of physical ones:

| ❌ Physical (Avoid) | ✅ Logical (Use) | Description |
|---------------------|------------------|-------------|
| `ml-*` / `mr-*` | `ms-*` / `me-*` | Margin start/end |
| `pl-*` / `pr-*` | `ps-*` / `pe-*` | Padding start/end |
| `left-*` / `right-*` | `start-*` / `end-*` | Positioning |
| `text-left` / `text-right` | `text-start` / `text-end` | Text alignment |
| `border-l` / `border-r` | `border-s` / `border-e` | Borders |
| `rounded-l` / `rounded-r` | `rounded-s` / `rounded-e` | Border radius |

**Examples:**
```tsx
// Good - logical properties work for both LTR and RTL
<div className="ps-4 pe-6 border-s border-e">

// Bad - physical properties break in RTL
<div className="pl-4 pr-6 border-l border-r">
```

### RTL Font Support
- Arabic uses **Noto Sans Arabic** font
- Automatically applied when `dir="rtl"` is set on `<html>`
- CSS variable: `--font-arabic`

### Navigation with i18n
```typescript
import { usePathname, useRouter } from "@/i18n/routing"

const router = useRouter()
const pathname = usePathname()

// Navigate preserving locale
router.push(pathname)

// Navigate with different locale
router.replace(pathname, { locale: "ar" })
```

### Language Switcher
Use the built-in `LanguageSwitcher` component:
```typescript
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

// Place next to ThemeToggle
<div className="flex items-center gap-3">
  <LanguageSwitcher />
  <ThemeToggle />
</div>
```

### Translation Keys Organization
```
src/messages/
├── metadata    (page title, description)
├── nav         (navigation labels)
├── hero        (headline, descriptions, CTAs)
├── features    (feature cards)
├── marquee     (scrolling items)
├── stats       (statistics labels)
└── language    (language switcher labels)
```
