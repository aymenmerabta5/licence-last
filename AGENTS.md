# AGENTS.md — Coding Guidelines for AI Agents

> Last updated: 2026-02-11
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

# Type checking
bun run typecheck

# Linting (ESLint with Next.js config)
bun run lint

# Testing
bun test              # Run all tests
bun test:watch        # Watch mode
bun test:coverage     # With coverage report

# Database (auto-loads .env.development)
bun run db:generate         # Generate migrations from schema
bun run db:migrate          # Apply migrations (dev DB)
bun run db:push             # Push schema changes (dev only)
bun run db:studio           # Drizzle Studio GUI
bun run db:reset            # Reset database
bun run db:seed             # Seed database with sample data

# Production database (use carefully)
bun run db:migrate:prod     # Migrate production database
bun run db:studio:prod      # Studio for production

# MCP Server (development only)
bun run mcp:dev             # Start MCP development server
```

**Note:** This project uses Bun as the package manager (`bun.lock` present).

---

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 16.1.6 |
| React | React | 19.2.3 |
| Language | TypeScript | 5.x (strict mode) |
| Styling | Tailwind CSS | 4.x + `@theme inline` |
| UI Components | shadcn/ui | 3.8.3 (base-nova style) |
| Animation | motion | 12.33.0 (Framer Motion successor) |
| Icons | lucide-react | 0.563.0 |
| Fonts | DM Sans, DM Serif Display, Noto Sans Arabic | Google Fonts |
| Testing | Bun Test Runner | Built-in |
| Test Utils | @testing-library/react | 16.3.2 |
| DOM Testing | happy-dom | 20.5.0 |

### State Management & Data
| Category | Technology | Version |
|----------|------------|---------|
| Server State | @tanstack/react-query | 5.90.20 |
| Forms | @tanstack/react-form | 1.28.0 |
| ORM | drizzle-orm | 0.45.1 |
| Database | PostgreSQL | via postgres driver |
| Migrations | drizzle-kit | 0.31.9 |
| Validation | zod | 4.3.6 |

### Backend & API
| Category | Technology | Version |
|----------|------------|---------|
| API Framework | @orpc/server | 1.13.4 |
| API Client | @orpc/client | 1.13.4 |
| Query Integration | @orpc/tanstack-query | 1.13.4 |
| Rate Limiting | @orpc/experimental-ratelimit | 1.13.5 |
| Authentication | better-auth | 1.4.18 |
| Server Marker | server-only | 0.0.1 |

### AI & External Services
| Category | Technology | Version |
|----------|------------|---------|
| AI SDK | ai | 6.0.78 |
| OpenAI Provider | @ai-sdk/openai | 3.0.26 |
| React AI Hooks | @ai-sdk/react | 3.0.80 |
| Arcade Tools | @arcadeai/arcadejs | 2.2.0 |
| Email Sending | resend | 6.9.1 |
| Email Templates | @react-email/components | 1.0.7 |
| PDF Generation | @react-pdf/renderer | 4.3.2 |

### i18n & Theming
| Category | Technology | Version |
|----------|------------|---------|
| Internationalization | next-intl | 4.8.2 |
| Theming | next-themes | 0.4.6 |

### Utilities
| Category | Technology | Version |
|----------|------------|---------|
| Class Variance | class-variance-authority | 0.7.1 |
| Class Merging | tailwind-merge | 3.4.0 |
| Conditional Classes | clsx | 2.1.1 |
| Environment | @t3-oss/env-nextjs | 0.13.10 |
| Charts | recharts | 2.15.4 |
| Toast Notifications | sonner | 2.0.7 |
| Drawers | vaul | 1.1.2 |

---

## MVC Architecture (Services + oRPC + TanStack Query)

This project uses **Postgres + Drizzle** (`src/server/db/*`) with an MVC architecture:

- **Model** (`src/server/services/`) — Pure business logic, `import "server-only"`, no auth coupling
- **Controller** (`src/server/orpc/`) — oRPC router for ALL client-server communication
- **View** — React components (Server Components + Client Components)

### Services (Model Layer)

Put all business logic in `src/server/services/<domain>/`:
- Reads: `get.ts`, `list.ts`
- Writes: `create.ts`, `update.ts`, `approve.ts`, `reject.ts`, `delete.ts`
- Always add `import "server-only"` at the top
- Functions take plain data + userId — never handle auth themselves
- Import `db` from `@/server/db` and schema from `@/server/db/schema`

**Service Pattern:**
```typescript
import "server-only"
import { db } from "@/server/db"
import { companies } from "@/server/db/schema/companies"

export async function createCompany(data: CreateCompanyInput, userId: string) {
  // Pure DB logic, no auth checks
  const [company] = await db.insert(companies).values({ ...data, userId }).returning()
  return { companyId: company.id, slug: company.slug }
}
```

**Service Domains (17 total):**
- `ai/` — AI/LLM integration (rate limits, context, model config, arcade tools)
- `applications/` — Internship applications (apply, withdraw, pipeline, company actions)
- `assistant/` — AI assistant conversations (CRUD, messages)
- `companies/` — Company management (CRUD, approval, trust index, reports)
- `documents/` — Document generation (agreements, certificates)
- `matching/` — Student-offer matching (scoring, skill gaps, readiness)
- `notifications/` — User notifications (create, list, mark read)
- `offers/` — Internship offers (CRUD, search, status management)
- `placements/` — Placement validation (list pending, validate, reject)
- `skills/` — Skills/tags management
- `students/` — Student profiles (get, upsert, public profiles)
- `universities/` — University data
- `uploads/` — File upload handling (S3)
- `users/` — User management (get-me, update, promote)

### oRPC Controller Layer

All client reads AND mutations go through oRPC at `src/server/orpc/`:

**Core Files:**
- **Middleware** (`middleware.ts`): Auth procedure chain
- **Rate-Limited Procedures** (`rate-limited-procedures.ts`): Pre-composed rate-limited variants
- **Rate Limit Middleware** (`ratelimit-middleware.ts`): Rate limiting factory
- **Router** (`router.ts`): Combines all route procedures into `appRouter`
- **Client** (`client.ts`): `orpcClient` for direct calls, `orpc` for TanStack Query utils
- **API handler** (`src/app/api/rpc/[...rest]/route.ts`): Catch-all oRPC handler

**Auth Procedures (Middleware Chain):**
```typescript
publicProcedure              // No auth required
├── authedProcedure          // Valid session required
│   ├── adminProcedure       // admin or super_admin role
│   ├── superAdminProcedure  // super_admin only
│   ├── companyAdminProcedure // company_admin + injects companyMembership
│   └── studentProcedure     // student role + injects studentProfile
```

**Rate-Limited Procedures:**
```typescript
// Pre-composed procedures with rate limiting
publicProcedureStrict        // 5 req/min (auth endpoints)
publicProcedureStandard      // 100 req/min (public reads)
authedProcedureStandard      // 100 req/min (general API)
authedProcedureGenerous      // 300 req/min (listings, searches)
authedProcedureStrict        // 5 req/min (sensitive ops)
adminProcedureGenerous       // 300 req/min (bulk admin ops)
assistantProcedureLimited    // 20 req/min (AI calls)
companyAdminProcedure*       // Various limits for company admins
```

**oRPC Routes (12 total):**
- `users.ts` — getMe, updateMe, promoteUser
- `companies.ts` — CRUD, approval, trust index, reports, logo upload
- `students.ts` — Profile management
- `offers.ts` — Offer CRUD, status updates
- `applications.ts` — Apply, withdraw, pipeline, company actions
- `skills.ts` — Skill tag listing
- `placements.ts` — Validation workflows
- `documents.ts` — Agreement generation
- `notifications.ts` — Notification management
- `stats.ts` — Admin statistics
- `assistant.ts` — AI assistant conversations
- `matching.ts` — Matching scores, skill gaps

### Client Usage Patterns

```typescript
// Direct call (forms, one-off operations)
import { orpcClient } from "@/server/orpc/client"
const me = await orpcClient.users.getMe()

// TanStack Query (reactive reads)
import { orpc } from "@/server/orpc/client"
const { data } = useQuery(orpc.companies.list.queryOptions({ input: { status: "approved" } }))

// TanStack Query (mutations with cache invalidation)
const queryClient = useQueryClient()
const { mutateAsync } = useMutation(
  orpc.companies.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.companies.list.queryOptions().queryKey })
    },
  })
)
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
- `company.ts` — company onboarding and profile schemas
- `student.ts` — student profile schemas (education, experience, skills)
- `offer.ts` — internship offer creation schemas
- `search.ts` — search and filter schemas
- `matching.ts` — matching criteria schemas

**Schema Factory Pattern (with i18n):**
```typescript
export function createLoginSchema(t: TranslationFn) {
  return z.object({
    email: z.string().email({ message: t("emailInvalid") }),
    password: z.string().min(8, { message: t("passwordMin") }),
  })
}
```

### Frontend Form Validation (Required)

- Use **TanStack Form** with schemas from `src/lib/schemas/` for client validation
- oRPC `.input()` provides mandatory server-side validation
- After mutations, invalidate TanStack Query caches as needed

**TanStack Form Pattern:**
```typescript
const form = useForm({
  defaultValues: { email: "", password: "" },
  validators: {
    onSubmit: ({ value }) => {
      const result = schema.safeParse(value)
      if (!result.success) {
        return { fields: mapErrors(result.error) }
      }
    },
  },
  onSubmit: async ({ value }) => {
    await authClient.signIn.email({ email: value.email, password: value.password })
  },
})
```

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
- **Typography**: `--font-sans` (DM Sans), `--font-serif` (DM Serif), `--font-arabic` (Noto Sans Arabic)

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

### Animation Patterns

**Reveal Animation (Standard):**
```typescript
const reveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}
const ease = [0.4, 0, 0.2, 1] as const

// Usage
<motion.div {...reveal} transition={{ duration: 0.6, ease, delay: 0.1 }}>
```

### File Organization

All source code lives under the `src/` directory. Configuration files stay at root.

```
src/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Root redirect → /en
│   ├── layout.tsx              # Root layout (fonts, html)
│   ├── globals.css             # Global styles + theme variables
│   ├── api/                    # API routes
│   │   ├── auth/[...all]/      # Better Auth
│   │   └── rpc/[...rest]/      # oRPC catch-all
│   └── [locale]/               # i18n routes
│       ├── layout.tsx          # Locale layout (providers)
│       ├── page.tsx            # Home page
│       ├── _components/        # Route-specific components
│       ├── (auth)/             # Auth route group
│       │   ├── layout.tsx
│       │   ├── login/
│       │   ├── signup/
│       │   └── reset-password/
│       ├── (authenticated)/    # Protected routes
│       │   └── dashboard/      # Dashboard routes
│       └── onboarding/         # Onboarding flows
│
├── components/                 # Shared components
│   ├── ui/                     # shadcn/ui components (auto-generated)
│   ├── form-fields/            # Shared form field components
│   ├── providers/              # Context providers
│   └── [ComponentName].tsx     # Shared components
│
├── lib/                        # Utilities & shared logic
│   ├── utils.ts                # cn() utility
│   ├── auth.ts                 # Better Auth server config
│   ├── auth-client.ts          # Better Auth client
│   ├── auth-guards.ts          # RSC layout guards
│   ├── schemas/                # Client-safe Zod schemas
│   └── [utility].ts            # Other utilities
│
├── hooks/                      # Shared hooks
│   ├── use-mobile.ts
│   ├── use-skill-selection.ts
│   ├── use-skill-grouping.ts
│   └── index.ts                # Barrel export
│
├── server/                     # Server-only code
│   ├── db/                     # Drizzle database
│   │   ├── index.ts            # Drizzle client
│   │   ├── schema/             # Database schemas (17 modules)
│   │   └── migrations/         # Migration files
│   ├── orpc/                   # oRPC controller layer
│   │   ├── middleware.ts       # Auth procedures
│   │   ├── rate-limited-procedures.ts
│   │   ├── router.ts           # Combined router
│   │   ├── client.ts           # Client + TanStack Query
│   │   └── routes/             # Procedure definitions
│   ├── services/               # Pure business logic (17 domains)
│   ├── actions/                # Server Actions
│   ├── storage/                # S3 file storage
│   ├── email/                  # Email service
│   ├── caching/                # Redis caching
│   └── mcp/                    # Model Context Protocol
│
├── i18n/                       # next-intl configuration
│   ├── routing.ts
│   └── request.ts
│
├── messages/                   # Translation JSON files
│   ├── en.json
│   ├── fr.json
│   └── ar.json
│
├── env.ts                      # T3 Env validation
└── proxy.ts                    # Next.js middleware (i18n + auth)
```

---

## Large Component Structure Pattern

When a component exceeds **400 lines** or contains multiple logical sections, use the **folder-based co-location pattern**:

### Folder Structure

```
_components/
├── ComponentName/
│   ├── index.tsx              # Main component (orchestration, ~60-100 lines)
│   ├── types.ts               # TypeScript interfaces
│   ├── utils.ts               # Helper functions, constants
│   ├── components/            # Sub-components used only by this feature
│   │   ├── HeaderSection.tsx
│   │   ├── ContentCard.tsx
│   │   └── ActionButtons.tsx
│   └── hooks/                 # Hooks specific to this feature
│       └── useComponentData.ts
```

### When to Split

| Extract to Hook | Extract to Component |
|-----------------|---------------------|
| State management logic | UI/JSX blocks |
| API calls & data fetching | Repeated markup patterns |
| Complex event handlers | Independent visual sections |
| Computed/derived values | Sub-components with own props |

### Example: ProfileContent (591 lines → folder)

**Before:** Single 591-line file with header, stats, contact, skills, bio, education, experience.

**After:**
```
ProfileContent/
├── index.tsx                  # Main orchestration (~70 lines)
├── types.ts                   # StudentData, ProfileUser, etc.
├── utils.ts                   # roleLabels, getInitials, formatMemberSince
├── components/
│   ├── ProfileHeader.tsx      # Cover + Avatar + Name
│   ├── ProfileStats.tsx       # Stats grid
│   ├── ContactInfoCard.tsx    # Email, phone, location
│   ├── SkillsCard.tsx         # Skills display
│   ├── SocialLinks.tsx        # GitHub, Portfolio
│   ├── BioSection.tsx         # Bio display
│   ├── EducationSection.tsx   # University info
│   └── ExperienceSection.tsx  # Experience placeholder
└── hooks/
    └── useProfileData.ts      # Computed values from props
```

### Shared Components

Components reused across multiple features go in `src/components/`:

```
src/components/
├── ui/                        # Primitives (shadcn)
├── form-fields/               # Shared form fields (new)
│   ├── TextField.tsx
│   ├── TextAreaField.tsx
│   ├── SelectField.tsx
│   ├── PasswordField.tsx
│   ├── CheckboxField.tsx
│   ├── FormSection.tsx
│   └── index.ts
├── ServerError.tsx            # Shared error display
├── SuccessMessage.tsx         # Shared success display
├── FormHeader.tsx             # Shared header with back button
├── SubmitButton.tsx           # Shared submit with loading
└── ...
```

### Shared Hooks

Hooks reused across multiple features go in `src/hooks/`:

```
src/hooks/
├── use-mobile.ts              # Existing
├── use-skill-grouping.ts      # Groups skills by category
├── use-skill-selection.ts     # Selection state + toggle logic
└── index.ts
```

### Naming Conventions

- **Folder name**: Matches the original component name (`ProfileContent/`, `OfferForm/`)
- **Main file**: `index.tsx` (enables clean imports)
- **Sub-components**: Descriptive, focused names (`ProfileHeader`, `ContactInfoCard`)
- **Hooks**: `use + FeatureName + Purpose` (`useOnboardingForm`, `useProfileData`)
- **Types file**: `types.ts` (all interfaces for the feature)
- **Utils file**: `utils.ts` (constants, formatters, helpers)

### Import Pattern

```typescript
// Before
import { ProfileContent } from "./_components/ProfileContent"

// After (same import path, folder resolves to index.tsx)
import { ProfileContent } from "./_components/ProfileContent"
```

### Decision Tree

```
Component > 400 lines?
├── Yes → Split into ComponentName/ folder
│   ├── Has stateful logic? → Extract to hooks/
│   ├── Has distinct UI sections? → Extract to components/
│   └── Has shared types/constants? → Extract to types.ts / utils.ts
└── No → Keep as single file
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
├── metadata         (page titles, descriptions)
├── nav              (navigation labels)
├── hero             (headlines, CTAs)
├── features         (feature cards)
├── marquee          (scrolling items)
├── stats            (statistics display)
├── language         (language switcher)
├── theme            (theme toggle)
├── notFound         (404 page)
├── auth             (login, signup, reset-password, validation)
├── onboarding       (company, student setup)
└── dashboard        (extensive nested structure)
    ├── nav          (sidebar navigation)
    ├── assistant    (AI assistant interface)
    ├── notifications (notification center)
    ├── company      (offers, candidates, profile)
    ├── student      (profile, applications)
    ├── explore      (internship search)
    ├── offerDetail  (application flow)
    ├── applications (tracking)
    └── admin        (validations, stats)
```

---

## Form Fields Library

Shared form field components in `src/components/form-fields/` provide consistent styling and behavior:

### Available Components

```typescript
import {
  TextField,
  TextAreaField,
  SelectField,
  PasswordField,
  CheckboxField,
  FormSection,
} from "@/components/form-fields"
```

### TextField Pattern

```typescript
interface TextFieldProps {
  id: string
  label: string
  placeholder?: string
  icon?: LucideIcon
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  disabled?: boolean
  className?: string
}

// Usage with TanStack Form
<form.Field name="email">
  {(field) => (
    <TextField
      id="email"
      label={t("emailLabel")}
      placeholder="user@example.com"
      icon={Mail}
      value={field.state.value}
      onChange={(v) => field.handleChange(v)}
      onBlur={field.handleBlur}
      error={field.state.meta.errors[0]}
    />
  )}
</form.Field>
```

### FormSection Pattern

```typescript
<FormSection
  title={t("sectionTitle")}
  description={t("sectionDescription")}
>
  {/* Form fields */}
</FormSection>
```

---

## Testing Configuration

### Test Setup Files

**`bunfig.toml`:**
```toml
[test]
preload = ["./src/test-setup.ts"]
```

**`src/test-setup.ts`:**
```typescript
import { Window } from "happy-dom"

// Initialize happy-dom before any imports
const window = new Window({ url: "http://localhost:3000" })
global.window = window
global.document = window.document
// ... other globals

import { expect, mock } from "bun:test"
import * as matchers from "@testing-library/jest-dom/matchers"

// Mock server-only guard for tests
mock.module("server-only", () => ({}))

expect.extend(matchers)
```

### React Component Testing

```typescript
import { describe, test, expect, beforeEach, mock } from "bun:test"
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react"

describe("LoginForm", () => {
  beforeEach(() => {
    mockFn.mockClear()
  })

  afterEach(() => {
    cleanup()
  })

  test("should render form", () => {
    render(<LoginForm />)
    expect(screen.getByText("Sign In")).toBeDefined()
  })
})
```

### Schema Testing Pattern (with i18n)

```typescript
function t(key: string) { return `t:${key}` }

describe("login schema", () => {
  const schema = createLoginSchema(t)

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
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("t:emailInvalid")
    }
  })
})
```

---

## Additional Server Patterns

### Rate Limiting

Conditional Redis-based rate limiting with graceful fallback:

**`src/server/caching/redis-ratelimiter.ts`:**
```typescript
import "server-only"
import { RedisRatelimiter } from "@orpc/experimental-ratelimit/redis"

export function getRateLimiter(): RedisRatelimiter | null
export function isRateLimitingEnabled(): boolean
```

### MCP (Model Context Protocol) Server

Development-only MCP server for AI tool testing:

**`src/server/mcp/`:**
- `index.ts` - Entry point with stdio transport
- `server.ts` - MCP server setup
- `guards.ts` - Environment safety checks
- `confirmation.ts` - Mutating operation guards
- `mock/ledger.ts` - Mock state for testing

**Dev script:** `bun run mcp:dev`

### S3 File Storage

**`src/server/storage/s3.ts`:**
```typescript
import "server-only"

export async function uploadFile(
  key: string,
  data: Buffer | ReadableStream,
  contentType: string
): Promise<string>

export async function deleteFile(key: string): Promise<void>
```

### Email Service

**`src/server/email/sendEmail.ts`:**
```typescript
import "server-only"

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string
  subject: string
  react: React.ReactElement
}): Promise<void>
```

Uses React Email components (`@react-email/*`) and Resend for delivery.

### Document Generation (PDF)

**`src/server/services/documents/`:**
- `generate-agreement.ts` — Generate internship agreements
- `generate-certificate.ts` — Generate completion certificates

Uses `@react-pdf/renderer` with React PDF templates.

### AI/Assistant Feature

**Services:** `src/server/services/assistant/`
- `get.ts`, `list.ts` — Conversation CRUD
- `create.ts`, `update.ts` — Mutations
- `messages.ts` — Message handling

**Routes:** `src/server/orpc/routes/assistant.ts`

**Features:**
- AI-powered chat interface
- Tool calling with authorization
- Conversation persistence
- Rate limiting for AI calls

### Matching System

**`src/server/services/matching/`:**
- `score.ts` — Calculate student-offer match scores
- `skill-gap.ts` — Identify missing skills
- `readiness-history.ts` — Track readiness over time

### Trust System

**`src/server/services/companies/trust-index.ts`:**
- Calculate company trust scores
- Handle trust reports and feedback

---

## Environment Variables

### Server Variables
```
DATABASE_URL                    # Required - PostgreSQL connection
BETTER_AUTH_SECRET             # Required - Auth secret
POE_API_KEY                    # Required - AI provider API key
POE_MODEL                      # Optional - Default AI model
POE_ALLOWED_MODELS             # Optional - Comma-separated model list
POE_BASE_URL                   # Optional - Custom AI endpoint
ARCADE_API_KEY                 # Required - Arcade AI tools API key
RESEND_API_KEY                 # Optional - Email service API key
EMAIL_FROM                     # Optional - Default sender email
S3_BUCKET                      # Optional - S3 bucket name
S3_ENDPOINT                    # Optional - S3 endpoint URL
S3_ACCESS_KEY_ID               # Optional - S3 access key
S3_SECRET_ACCESS_KEY           # Optional - S3 secret key
S3_REGION                      # Optional - Default: "auto"
S3_PUBLIC_URL                  # Optional - Public S3 URL
AWS_ACCESS_KEY_ID              # Optional - AWS access (alternative)
AWS_SECRET_ACCESS_KEY          # Optional - AWS secret (alternative)
REDIS_URL                      # Optional - Redis connection URL
REDIS_RATE_LIMIT_ENABLED       # Optional - Default: "false"
```

### Client Variables
```
NEXT_PUBLIC_BETTER_AUTH_URL    # Required - Auth callback URL
NEXT_PUBLIC_S3_ENDPOINT        # Optional - Public S3 endpoint
NEXT_PUBLIC_S3_URL             # Optional - Public S3 base URL
```
