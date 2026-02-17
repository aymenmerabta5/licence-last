# AGENTS.md — Coding Guidelines for AI Agents

> Last updated: 2026-02-16
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
bun test:orpc-routes  # oRPC controller route + smoke tests

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
| Markdown | react-markdown + remark-gfm | 10.1.0 |
| Syntax Highlight | react-syntax-highlighter | 16.1.0 |
| QR Codes | qrcode.react | 4.2.0 |
| Testing | Bun Test Runner | Built-in |
| Test Utils | @testing-library/react | 16.3.2 |
| DOM Testing | happy-dom | 20.5.0 |
| E2E Testing | Playwright | latest |

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
| OpenAI Provider | @ai-sdk/openai (Poe-compatible) | 3.0.26 |
| React AI Hooks | @ai-sdk/react | 3.0.80 |
| Arcade Tools | @arcadeai/arcadejs | 2.2.0 |
| Email Sending | resend | 6.9.1 |
| Email Templates | @react-email/components | 1.0.7 |
| Email Rendering | @react-email/render + @react-email/tailwind | 2.0.4 |
| PDF Generation | @react-pdf/renderer | 4.3.2 |
| Logging | pino | 5.0.0 |

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
- Throw typed `ServiceError` codes for domain failures (avoid generic `Error`)

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

**Service Domains (16 total):**
- `admin/` — Admin user ops (ban, create, list, remove, sessions, setPassword, setRole, update)
- `applications/` — Internship applications (apply, withdraw, pipeline, company actions, timeline)
- `assistant/` — AI assistant conversations (CRUD, messages)
- `companies/` — Company management (CRUD, approval, membership, trust index, trust actions, reports)
- `departments/` — Department management (create, list, update, delete, assign/unassign head, assign by email, bulk create, skills sync)
- `documents/` — Document generation + verification (agreements, certificates, QR codes, verification)
- `matching/` — Student-offer matching (scoring, skill gaps, readiness history)
- `notifications/` — User notifications (create, list, mark read)
- `offers/` — Internship offers (CRUD, search, status management, delete)
- `placements/` — Placement validation (list pending, validate, reject — admin + dept head)
- `skills/` — Skills/tags management (list, validate)
- `stats/` — Admin dashboard analytics
- `students/` — Student profiles (get, upsert, public profiles, dashboard stats)
- `universities/` — University management (CRUD, approve, reject)
- `uploads/` — File upload handling (S3)
- `users/` — User management (get-me, get-by-id, update, promote)

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
│   ├── adminProcedure       // university_admin, dept_head, or super_admin
│   ├── superAdminProcedure  // super_admin only
│   ├── companyAdminProcedure // company_admin + injects companyMembership
│   ├── studentProcedure     // student role + injects studentProfile
│   └── deptHeadProcedure    // dept_head + injects departmentId + universityId
```

**Rate-Limited Procedures (18 variants):**
```typescript
// Pre-composed procedures with rate limiting
publicProcedureStrict               // 5 req/min (auth endpoints)
publicProcedureStandard             // 100 req/min (public reads)
authedProcedureStandard             // 100 req/min (general API)
authedProcedureGenerous             // 300 req/min (listings, searches)
authedProcedureStrict               // 5 req/min (sensitive ops)
adminProcedureStandard              // 100 req/min (admin ops)
adminProcedureGenerous              // 300 req/min (bulk admin ops)
superAdminProcedureStandard         // 100 req/min (super admin ops)
superAdminProcedureGenerous         // 300 req/min (bulk super admin)
deptHeadProcedureStandard           // 100 req/min (dept head ops)
deptHeadProcedureGenerous           // 300 req/min (dept head reads)
companyAdminProcedureStandard       // 100 req/min (company ops)
companyAdminProcedureGenerous       // 300 req/min (company reads)
companyAdminProcedureAssistant      // 20 req/min (AI assistant)
studentProcedureStandard            // 100 req/min (student mutations)
studentProcedureGenerous            // 300 req/min (student reads)
assistantProcedureLimited           // 20 req/min (AI calls)
```

**oRPC Routes (15 route files, 88 procedures across 16 namespaces):**
- `users.ts` — getMe, updateMe, uploadAvatar, deleteAvatar (4)
- `companies.ts` — CRUD, approval, trust index, reports, quality feedback, logo upload (13)
- `students.ts` — getProfile, getPublicProfile, upsertProfile, upsertProfileDetails (4)
- `offers.ts` — CRUD, status updates, delete (6 — search is in applications file but offers namespace)
- `applications.ts` — checkApplication, apply, withdraw, pipeline, company actions, timeline, search (9 in namespace + search in offers)
- `skills.ts` — Skill tag listing (1)
- `placements.ts` — admin: listPending, validate, reject; deptHead: listPending, validate, reject (6)
- `departments.ts` — list, create, update, assignHead, unassignHead, delete, bulkCreateWithHeads, syncSkills, getSkills (9)
- `documents.ts` — generateAgreement, verify (2)
- `notifications.ts` — list, markRead, markAllRead (3)
- `stats.ts` — Admin statistics (1)
- `admin-users.ts` — list, create, setRole, ban, unban, remove, setPassword, update, sessions, revokeSession, revokeAllSessions (11)
- `universities.ts` — list, getById, create, approve, reject (5)
- `assistant.ts` — listModels, conversations CRUD, messages, model/title updates (9)
- `matching.ts` — getScore, getSkillGap, getReadinessHistory, captureReadinessSnapshot (4)

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
- `university.ts` — university CRUD schemas
- `verify.ts` — document verification code schema
- `enums.ts` — shared enum schemas
- `map-errors.ts` — Zod error mapping utilities

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

**NEVER define `reveal`/`ease` locally — always import from `src/lib/animations.ts`:**

```typescript
import { reveal, ease, revealWithDelay } from "@/lib/animations"

// Usage
<motion.div {...reveal} transition={{ duration: 0.6, ease, delay: 0.1 }}>

// With pre-built delay helper
<motion.div {...reveal} transition={revealWithDelay(0.2)}>
```

Available exports from `@/lib/animations`:
- `reveal` — opacity 0→1 + y 20→0
- `ease` — cubic bezier [0.4, 0, 0.2, 1]
- `revealTransition` — `{ duration: 0.6, ease }`
- `revealWithDelay(delay)` — `{ duration: 0.6, ease, delay }`
- `fadeIn` — opacity only
- `slideUp` — y translation only

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
│   │   ├── rpc/[...rest]/      # oRPC catch-all (CSRF protected)
│   │   ├── assistant/chat/     # AI streaming endpoint
│   │   ├── assistant/auth/status/ # Arcade auth check
│   │   ├── openapi/            # OpenAPI spec + Swagger UI
│   │   └── health/             # Dependency-aware readiness endpoint
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
│   ├── auth-guards.ts          # RSC layout guards (requireRole)
│   ├── auth-utils.ts           # Auth helper functions
│   ├── date.ts                 # Date formatting utilities
│   ├── string.ts               # String utilities (slugify, etc.)
│   ├── profile-completeness.ts # Student profile completion %
│   ├── csrf.ts                 # CSRF token generation/validation
│   ├── post-login-redirect.ts  # Role-based redirect after login
│   ├── schemas/                # Client-safe Zod schemas (10 files)
│   ├── constants/              # Pipeline + internship constants
│   └── [utility].ts            # Other utilities
│
├── hooks/                      # Shared hooks
│   ├── useCopilot.ts           # AI chat transport + tool output
│   ├── useInfiniteScroll.ts    # IntersectionObserver pagination
│   ├── useDebounce.ts          # Value debouncing
│   ├── useLogout.ts            # Auth signout + redirect
│   ├── useFormWithSchema.ts    # TanStack Form + Zod integration
│   ├── use-mobile.ts           # Mobile breakpoint detection
│   ├── use-skill-selection.ts  # Multi-select state
│   ├── use-skill-grouping.ts   # Skill categorization
│   └── index.ts                # Barrel export
│
├── server/                     # Server-only code
│   ├── db/                     # Drizzle database
│   │   ├── index.ts            # Drizzle client
│   │   ├── schema/             # Database schemas (19 modules)
│   │   └── migrations/         # Migration files
│   ├── orpc/                   # oRPC controller layer
│   │   ├── middleware.ts       # Auth procedures (7 types)
│   │   ├── rate-limited-procedures.ts  # 18 variants
│   │   ├── router.ts           # Combined router (88 procedures)
│   │   ├── client.ts           # Client + TanStack Query
│   │   └── routes/             # 15 route files
│   ├── services/               # Pure business logic (16 domains)
│   ├── ai/                     # AI integration (model, tools, context, prompts)
│   ├── openapi/                # OpenAPI spec generation
│   ├── pdfs/                   # PDF templates (AgreementTemplate, CertificateTemplate)
│   ├── storage/                # S3 file storage (Bun.S3Client)
│   ├── email/                  # Email service (Resend + React Email)
│   ├── caching/                # Redis client + rate limiter
│   ├── logging/                # Pino structured logging
│   └── mcp/                    # Model Context Protocol (dev only)
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

## Feature Folder Architecture

Any `_components/` client component exceeding **150 lines** must become a **feature folder**. This is mandatory — no exceptions.

### The Feature Folder Shape

```
FeatureName/
  index.tsx                    # Orchestrator (MAX 120 lines)
  hooks/
    useFeatureData.ts          # All useQuery/useMutation/useInfiniteQuery
    useFeatureState.ts         # Complex UI state (3+ useState, optional)
  components/
    SectionA.tsx               # Pure UI, props only (max 200 lines)
    SectionB.tsx               # Pure UI, props only (max 200 lines)
  types.ts                     # TypeScript interfaces for the feature
  constants.ts                 # Feature-specific constants only (optional)
  utils.ts                     # Helpers, formatters (optional)
```

### Layer Rules

**index.tsx (Orchestrator)**
- Only layout + wiring. Imports hooks and components, passes data as props.
- **No** `useQuery`, `useMutation`, `useInfiniteQuery` — these belong in `hooks/`.
- **No** complex JSX blocks (> 30 lines of JSX per section → extract to `components/`).
- MAX 120 lines.

**hooks/ (Data Layer)**
- All data fetching lives here. Returns clean typed objects.
- Import from `@/server/orpc/client` for queries/mutations.
- One hook per concern: `useFeatureData.ts` (queries), `useFeatureState.ts` (UI state).
- Mutations return `{ mutateAsync, isPending }` patterns.

**components/ (UI Layer)**
- Pure UI. Receives ALL data via props.
- Can use `useTranslations` and `motion` — these are UI concerns.
- Max 200 lines each. If larger, split further.
- No direct imports from `@/server/orpc/client`.

**NOTE** When a component or a custom hook used in multiple places it will be moved to the general componenets, in the root components folder

### Shared Infrastructure (NEVER define locally)

| Module | Exports | Used by |
|--------|---------|---------|
| `src/lib/constants/pipeline.ts` | `STATUS_COLORS`, `STAGE_COLUMNS`, `STAGE_LABELS`, `PipelineStage` | Applications, Candidates, OfferDetail, Admin |
| `src/lib/constants/internship.ts` | `INTERNSHIP_TYPE_LABELS`, `INTERNSHIP_TYPE_COLORS` | Admin validations, Explore, OfferDetail |
| `src/lib/animations.ts` | `reveal`, `ease`, `fadeIn`, `slideUp`, `revealTransition`, `revealWithDelay` | All animated components |
| `src/hooks/useInfiniteScroll.ts` | `useInfiniteScroll(fetchNextPage, hasNextPage)` | Applications, Candidates, Explore |
| `src/hooks/useDebounce.ts` | `useDebounce(value, delay)` | Explore, SkillsManager |
| `src/hooks/useLogout.ts` | `useLogout()` → `{ logout, isLoggingOut }` | Navbar, DashboardSidebar, DashboardNavbar |
| `src/hooks/useCopilot.ts` | `useCopilot({ toolName, onResult })` | OfferDetail, OfferForm, PlacementDetail, Explore |

### Shared Components

Components reused across multiple features go in `src/components/`:

```
src/components/
├── ui/                        # Primitives (shadcn)
├── form-fields/               # Shared form field components
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
├── use-mobile.ts              # Mobile breakpoint detection
├── use-skill-grouping.ts      # Groups skills by category
├── use-skill-selection.ts     # Selection state + toggle logic
├── useInfiniteScroll.ts       # IntersectionObserver + fetchNextPage
├── useDebounce.ts             # Debounced value
├── useLogout.ts               # Logout + redirect
├── useCopilot.ts              # AI chat transport + useChat + tool output
└── index.ts                   # Barrel export
```

### Reference Implementation: ProfileContent

```
ProfileContent/
├── index.tsx                  # 108 lines — layout + wiring
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

### Naming Conventions

- **Folder name**: Matches the component name (`ProfileContent/`, `OfferForm/`)
- **Main file**: `index.tsx` (enables same import path as before)
- **Sub-components**: Descriptive, focused names (`ProfileHeader`, `ContactInfoCard`)
- **Hooks**: `use + FeatureName + Purpose` (`useOfferData`, `useCandidateActions`)
- **Types file**: `types.ts` (all interfaces for the feature)
- **Utils file**: `utils.ts` (constants, formatters, helpers)

### Decision Tree

```
Component > 150 lines?
├── Yes → Feature folder (mandatory)
│   ├── Has useQuery/useMutation? → hooks/useFeatureData.ts
│   ├── Has 3+ useState? → hooks/useFeatureState.ts
│   ├── Has STATUS_COLORS/STAGE_LABELS? → import from src/lib/constants/pipeline
│   ├── Has INTERNSHIP_TYPE_*? → import from src/lib/constants/internship
│   ├── Has reveal/ease? → import from src/lib/animations (NEVER local)
│   ├── Has IntersectionObserver? → use src/hooks/useInfiniteScroll
│   ├── Has useChat/DefaultChatTransport? → use src/hooks/useCopilot
│   └── Has distinct UI sections? → components/
└── No → Keep as single file
```

### Migration Mapping

| Component | Lines | Target Folder | Key Extractions |
|-----------|-------|---------------|-----------------|
| CompanyOffersPageClient | 295 | `CompanyOffersView/` | hooks: queries + mutations |
| SkillsManager | 260 | `SkillsManager/` | hooks: skills + search state |
| ApplicationsClient | 312 | `ApplicationsView/` | hooks: infiniteQuery; shared: pipeline constants, useInfiniteScroll |
| CandidatesClient | 495 | `CandidatesView/` | hooks: infiniteQuery + actions; shared: pipeline constants, useInfiniteScroll |
| ExploreClient | 390 | `ExploreClient/` | hooks: search + copilot; shared: useInfiniteScroll, useCopilot |
| AssistantChat | 296 | `AssistantChat/` | hooks: chat session; already has components/ |
| ProfileSettingsTab | 432 | `ProfileSettingsTab/` | hooks: form + mutations |
| OfferForm | 750 | `OfferForm/` | hooks: form + copilot; already has types.ts + utils.ts |
| OfferDetailClient | 631 | `OfferDetail/` | hooks: matching + application + copilot |
| PlacementDetailClient | 635 | `PlacementDetail/` | hooks: data + actions + copilot |

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
bun test:unit         # Unit/core modules (segmented to avoid mock collisions)
bun test:orpc-routes  # oRPC controller route + smoke tests
bun test:api          # API route tests + oRPC route suite
bun test:pages        # App Router page/component tests (src/app/[locale])
bun test:e2e          # Playwright E2E (chromium)
bun test:ci           # unit + api + pages (CI pipeline)
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

### Health Readiness Endpoint

`GET /api/health` returns structured readiness details instead of a plain `"ok"`:

- `checks.database` — required dependency (driven by `pingDatabase()` in `src/server/db/index.ts`)
- `checks.redis` — optional dependency (`pingRedis()` / `isRedisAvailable()`)
- `checks.rateLimiter` — reflects `isRateLimitingEnabled()` and Redis availability

Response status:
- `200` for `ok`/`degraded`
- `503` for `error` when required dependencies are unhealthy

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

**`src/server/storage/s3.ts`** (uses Bun's native `Bun.S3Client`):
```typescript
import "server-only"

export async function uploadFile(key: string, data: Buffer, contentType: string): Promise<string>
export async function deleteFile(key: string): Promise<void>
export function isConfigured(): boolean
```

Supports AWS S3, Cloudflare R2, or any S3-compatible endpoint.

### Structured Logging

**`src/server/logging/logger.ts`** (Pino):
```typescript
import "server-only"

export const logger: pino.Logger
export function createLogger(bindings: Record<string, unknown>): pino.Logger
export function createModuleLogger(module: string): pino.Logger
```

Automatic redaction of sensitive fields (authorization, cookie, password, token, api_key, secret).
Configurable log level via `LOG_LEVEL` env var (default: "info").

### Email Service

**`src/server/email/sendEmail.ts`:**
```typescript
import "server-only"

export async function sendEmail<T>(
  to: string | string[],
  subject: string,
  EmailComponent: React.ComponentType<T>,
  componentProps: T,
  options?: { from?: string; replyTo?: string; cc?: string[]; bcc?: string[] }
): Promise<{ success: boolean; code?: string; message?: string; error?: string }>
```

Uses React Email components + Resend for delivery. Graceful fallback if `RESEND_API_KEY` not configured.

**Email Templates:** `VerifyEmailEmail`, `ResetPasswordEmail`, `TwoFactorOtpEmail`, `EmailLayout`

### Document Generation & Verification (PDF)

**`src/server/services/documents/`:**
- `generate-agreement.ts` — Generate internship agreements
- `generate-certificate.ts` — Generate completion certificates
- `qr-utils.ts` — QR code generation for documents
- `verification-code.ts` — Unique verification code generation
- `verify.ts` — Public document verification by code

**`src/server/pdfs/`:**
- `AgreementTemplate.tsx` — React PDF agreement template
- `CertificateTemplate.tsx` — React PDF certificate template

Uses `@react-pdf/renderer`. Each document gets a verification code + QR code. Public verification at `/verify/[code]`.

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

**UI Components** (`dashboard/admin/departments/_components/DepartmentsView/`):
- Feature folder with orchestrator, hooks layer (useDepartmentsData, useDepartmentsActions, useAssignHeadDialog, useDepartmentSkills), and pure UI components
- `DeleteDepartmentDialog.tsx` — Confirmation dialog for department deletion
- `RemoveHeadDialog.tsx` — Confirmation dialog for head removal
- `DepartmentSkillsModal/` — Skills management with search, toggle, and sync
- `BulkCreateForm/` — Sub-feature folder for bulk department import

### OpenAPI

**`src/server/openapi/generator.ts`** — Generates OpenAPI spec from oRPC router
- `GET /api/openapi/spec` — JSON OpenAPI specification
- `GET /api/openapi` — Swagger UI

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
POE_API_KEY                    # Optional - AI provider API key
POE_MODEL                      # Optional - Default AI model
POE_ALLOWED_MODELS             # Optional - Comma-separated model list
POE_BASE_URL                   # Optional - Custom AI endpoint
ARCADE_API_KEY                 # Optional - Arcade AI tools API key
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
LOG_LEVEL                      # Optional - Pino level (default: "info")
```

### Client Variables
```
NEXT_PUBLIC_BETTER_AUTH_URL    # Required - Auth callback URL
NEXT_PUBLIC_S3_ENDPOINT        # Optional - Public S3 endpoint
NEXT_PUBLIC_S3_URL             # Optional - Public S3 base URL
```

---

## Documentation Sync Policy

When adding or modifying features, **update all relevant documentation files** to keep them in sync:

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
