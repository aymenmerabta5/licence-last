# AGENTS.md - Stag.io

> Next.js 16 + React 19 + TypeScript + Bun | Editorial design aesthetic

---

## Commands

```bash
bun run dev              # Dev server
bun run build            # Production build
bun run typecheck        # Type checking
bun run lint             # Lint (run before committing)
bun run check:all        # Full pre-release checks

bun test                 # Run tests
bun test:watch           # Watch mode
bun test:ci              # CI pipeline

bun run db:generate      # Generate migrations
bun run db:migrate       # Apply migrations
bun run db:push          # Push schema (dev)
bun run db:seed          # Seed database
```

---

## Git Hooks (Husky)

A **pre-commit hook** is configured via Husky to automatically run `bun run check:all` before every commit. If any check fails (lint, typecheck, tests, or build), the commit is blocked.

The hook lives in `.husky/pre-commit`:
```bash
bun run check:all
```

**First-time setup** (after cloning):
```bash
bun install   # Installs dependencies + runs prepare script
```

If hooks are not active, enable Husky manually:
```bash
bun run prepare
```

**Bypass in emergencies** (not recommended for CI):
```bash
git commit --no-verify -m "..."
```

---

## Core Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript strict
- **Styling**: Tailwind CSS 4 with `@theme inline`, shadcn/ui
- **State**: TanStack Query + TanStack Form + Zod validation
- **Backend**: Drizzle ORM + PostgreSQL, oRPC for client-server communication
- **Auth**: better-auth
- **i18n**: next-intl (en, fr, ar) with RTL support
- **Animation**: `motion` (Framer Motion successor)
- **Testing**: Bun test runner + @testing-library/react

---

## Architecture

**MVC Pattern**: Services → oRPC → React Components

### Services (`src/server/services/<domain>/`)
- Pure business logic with `import "server-only"`
- Take plain data + userId (no auth handling)
- Use `db` from `@/server/db` and schema from `@/server/db/schema`
- Throw typed `ServiceError` codes

```typescript
import "server-only"
import { db } from "@/server/db"

export async function createCompany(data: CreateCompanyInput, userId: string) {
  const [company] = await db.insert(companies).values({ ...data, userId }).returning()
  return { companyId: company.id, slug: company.slug }
}
```

**Service domains**: admin, applications, assistant, companies, departments, documents, interviews, matching, messages, notifications, offers, placements, skills, stats, students, universities, uploads, users

### oRPC (`src/server/orpc/`)
- All client-server communication goes through oRPC
- Auth procedures: `publicProcedure`, `authedSessionProcedure`, `authedProcedure`, `adminProcedure`, `universityProcedure`, `superAdminProcedure`, `companyAdminProcedure`, `companyOwnerProcedure`, `studentProcedure`, `deptHeadProcedure`
- Rate-limited variants exist for all procedure types (25 total)

**Client patterns:**
```typescript
// Direct call
import { orpcClient } from "@/server/orpc/client"
const me = await orpcClient.users.getMe()

// TanStack Query
import { orpc } from "@/server/orpc/client"
const { data } = useQuery(orpc.companies.list.queryOptions({ input: { status: "approved" } }))

// Mutation with cache invalidation
const { mutateAsync } = useMutation(
  orpc.companies.create.mutationOptions({
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.companies.list.queryOptions().queryKey }),
  })
)
```

### Server Components (RSC)
Call services directly — no oRPC needed.

---

## Code Style

### Imports
- Always use `@/` aliases (never relative)
- Order: React/Next → third-party → `@/` aliases → local styles
- Use `type` for type imports

```typescript
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
```

### Naming
- Components: PascalCase
- Hooks: camelCase starting with `use`
- Constants: UPPER_SNAKE_CASE

### TypeScript
- Prefer `interface` over `type` for object shapes
- Strict mode — no implicit any

### Tailwind
- Use CSS variables from `globals.css` (not hardcoded values)
- Color tokens: `--color-background`, `--color-foreground`, `--color-primary`, `--color-heading`, etc.
- Use `cn()` from `@/lib/utils`

### Animations
**NEVER define `reveal`/`ease` locally — always import from `src/lib/animations.ts`:**

```typescript
import { reveal, ease, revealWithDelay } from "@/lib/animations"
<motion.div {...reveal} transition={{ duration: 0.6, ease, delay: 0.1 }}>
```

Exports: `reveal`, `ease`, `revealTransition`, `revealWithDelay(delay)`, `fadeIn`, `slideUp`

---

## Feature Folder Architecture

Components > 150 lines → **mandatory** feature folder:

```
FeatureName/
  index.tsx              # Orchestrator (MAX 120 lines, no queries)
  hooks/
    useFeatureData.ts    # useQuery/useMutation
    useFeatureState.ts   # Complex UI state
  components/            # Pure UI, props only, max 200 lines each
  types.ts
  utils.ts
```

**Rules:**
- `index.tsx`: Only layout + wiring, passes data as props
- `hooks/`: Data fetching, returns typed objects
- `components/`: No direct oRPC imports
- Reusable components → `src/components/`
- Reusable hooks → `src/hooks/`

---

## Shared Infrastructure (NEVER define locally)

| Module | Exports |
|--------|---------|
| `src/lib/constants/pipeline.ts` | `STATUS_COLORS`, `STAGE_COLUMNS`, `STAGE_LABELS` |
| `src/lib/constants/internship.ts` | `INTERNSHIP_TYPE_LABELS`, `INTERNSHIP_TYPE_COLORS` |
| `src/lib/animations.ts` | `reveal`, `ease`, `fadeIn`, `slideUp` |
| `src/hooks/useInfiniteScroll.ts` | Pagination helper |
| `src/hooks/useDebounce.ts` | Debounce utility |
| `src/hooks/useLogout.ts` | Auth signout |
| `src/hooks/useCopilot.ts` | AI chat transport |

---

## Internationalization

- Configuration: `src/i18n/routing.ts`, `src/i18n/request.ts`
- Messages: `src/messages/{en,fr,ar}.json`
- Routing: All pages under `src/app/[locale]/`

### RTL Support (Critical)
Use **logical CSS properties** for Arabic:

| ❌ Physical | ✅ Logical |
|-------------|-----------|
| `ml-*` / `mr-*` | `ms-*` / `me-*` |
| `pl-*` / `pr-*` | `ps-*` / `pe-*` |
| `left-*` / `right-*` | `start-*` / `end-*` |
| `text-left` / `text-right` | `text-start` / `text-end` |
| `border-l` / `border-r` | `border-s` / `border-e` |

### Usage
```typescript
// Server components
import { getTranslations } from "next-intl/server"
const t = await getTranslations("namespace")

// Client components
import { useTranslations } from "next-intl"
const t = useTranslations("namespace")

// Navigation
import { usePathname, useRouter } from "@/i18n/routing"
```

---

## Testing

- Use Bun test runner (`bun:test`) — no Jest
- Co-locate tests: `src/lib/*.test.ts`, `src/server/services/**/*.test.ts`
- Use `describe()` and `test("should...when...")` naming

```typescript
import { describe, test, expect } from "bun:test"

describe("feature", () => {
  test("should behave when condition", () => {
    expect(result).toBe(expected)
  })
})
```

---

## Schemas

Client-safe Zod schemas in `src/lib/schemas/` (NO `server-only`):
- `auth.ts`, `company.ts`, `student.ts`, `offer.ts`, `search.ts`, `matching.ts`, `university.ts`, `verify.ts`, `enums.ts`, `map-errors.ts`

Schema factory pattern for i18n:
```typescript
export function createLoginSchema(t: TranslationFn) {
  return z.object({
    email: z.string().email({ message: t("emailInvalid") }),
  })
}
```

Use TanStack Form with schemas for client validation.

---

## Form Fields

Shared components in `src/components/form-fields/`:
- `TextField`, `TextAreaField`, `SelectField`, `PasswordField`, `CheckboxField`, `FormSection`

---

## Design Principles

- Editorial elegance, warm aesthetic, magazine feel
- Serif headlines (`font-serif`), sans body (`font-sans`)
- Dark mode as first-class "Night Edition"
- Use `motion` for orchestrated animations, Tailwind for simple transitions
