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

## MVC Architecture (Services + oRPC + TanStack Query)

This project uses **Postgres + Drizzle** (`src/server/db/*`) with an MVC architecture:

- **Model** (`src/server/services/`) — Pure business logic, `import "server-only"`, no auth coupling
- **Controller** (`src/server/orpc/`) — oRPC router for ALL client-server communication
- **View** — React components (Server Components + Client Components)

### Services (Model Layer)

Put all business logic in `src/server/services/<domain>/`:
- Reads: `get.ts`, `list.ts`
- Writes: `create.ts`, `update.ts`, `approve.ts`, `reject.ts`
- Always add `import "server-only"` at the top
- Functions take plain data + userId — never handle auth themselves
- Import `db` from `@/server/db` and schema from `@/server/db/schema`

### oRPC Controller Layer

All client reads AND mutations go through oRPC at `src/server/orpc/`:

- **Middleware** (`middleware.ts`): Auth chain — `publicProcedure`, `authedProcedure`, `adminProcedure`, `superAdminProcedure`, `companyAdminProcedure`
- **Routes** (`routes/*.ts`): Define procedures with `.input(zodSchema).handler(fn)`
- **Router** (`router.ts`): Combines all route procedures into `appRouter`
- **Client** (`client.ts`): `orpcClient` for direct calls, `orpc` for TanStack Query utils
- **API handler** (`src/app/api/rpc/[...rest]/route.ts`): Catch-all oRPC handler

### Client Usage Patterns

```typescript
// Direct call (forms, one-off operations)
import { orpcClient } from "@/server/orpc/client"
const me = await orpcClient.users.getMe()

// TanStack Query (reactive reads)
import { orpc } from "@/server/orpc/client"
const { data } = useQuery(orpc.companies.list.queryOptions({ input: { status: "approved" } }))

// TanStack Query (mutations)
const { mutateAsync } = useMutation(orpc.companies.create.mutationOptions())
```

### Server Components (RSC)

Server Components call services **directly** — no oRPC needed:
```typescript
import { getCompanyByUserId } from "@/server/services/companies/get"
const company = await getCompanyByUserId(session.user.id)
```

### Shared Schemas

Client-safe Zod schemas in `src/lib/schemas/` (NO `server-only`):
- `auth.ts` — login, signup, reset password schemas
- `company.ts` — company onboarding schema

### Frontend Form Validation (Required)

- Use **TanStack Form** with schemas from `src/lib/schemas/` for client validation
- oRPC `.input()` provides mandatory server-side validation
- After mutations, invalidate TanStack Query caches as needed

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
- **Animation policy**:
  - Use Tailwind for transitions (`transition-*`, `duration-*`, `ease-*`)
  - Use `motion` (`motion/react-client`) for orchestrated animations (reveals, staggers, marquee/continuous motion)
  - Do not add custom CSS keyframes or global `.ed-*` utility classes in `src/app/globals.css`

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
│       ├── auth/[...all]/      # Better Auth
│       └── rpc/[...rest]/      # oRPC catch-all
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
│   ├── auth-guards.ts          # RSC layout guards
│   └── schemas/                # Client-safe Zod schemas
│       ├── auth.ts
│       └── company.ts
├── server/                     # Server-only code
│   ├── db/
│   │   ├── index.ts            # Drizzle client
│   │   └── schema/
│   │       └── auth.ts
│   ├── services/               # Pure business logic (Model)
│   │   ├── companies/          # get, list, create, approve, reject
│   │   └── users/              # get-me, promote
│   └── orpc/                   # oRPC controller layer
│       ├── middleware.ts        # Auth middleware chain
│       ├── router.ts           # Combined router
│       ├── client.ts           # Client + TanStack Query utils
│       └── routes/             # Procedure definitions
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
- Support `prefers-reduced-motion` (prefer Motion's reduced-motion support; avoid continuous motion when possible)
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
- `src/lib/schemas/*.test.ts` - Zod schemas and validation logic
- `src/server/services/**/*.test.ts` - Service functions (business logic)
- `src/components/ui/*.test.tsx` - UI components (when logic is complex)

### When to Write Tests

**Always write tests for:**
1. ✅ Utility functions in `src/lib/utils.ts`
2. ✅ All schemas in `src/lib/schemas/`
3. ✅ Service functions in `src/server/services/`
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
