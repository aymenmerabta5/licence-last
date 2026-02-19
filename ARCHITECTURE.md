# Internex Architecture

> Last updated: 2026-02-19
> Scope: Root architecture snapshot for contributors and coding agents.
> Sync note: Keep this file aligned with `docs/ARCHITECTURE.md`.

## 1. System Overview

Internex is a Next.js 16 + React 19 internship platform connecting students, companies, department heads, university admins, and super admins.

```text
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
                   Better Auth 136 procs  Poe AI
                          \       |      /
                       +-----------------------+
                       |    Services Layer     |
                       |    (18 domains)       |
                       +-----------+-----------+
                                   |
                     +-------------+-------------+
                     |             |             |
                PostgreSQL      Redis         S3/R2
                (Drizzle)    (Rate limit)    (Files)
```

## 2. Architecture Pattern (MVC + oRPC)

- Model: `src/server/services/*` (pure business logic, `import "server-only"`)
- Controller: `src/server/orpc/*` (auth middleware, rate limiting, transport validation)
- View: `src/app/*` + shared components/hooks (`RSC + Client Components`)

Operational rule:
- Client reads/mutations go through oRPC.
- RSC can call services directly when RPC transport is unnecessary.

## 3. Current Implementation Counts

Verified from source on 2026-02-19:

- Service domains: `18` (`src/server/services/*` directories)
- oRPC namespaces in `appRouter`: `19`
- Procedure handlers: `136` (`export const *Procedure` across route modules)
- Route modules with procedures: `18`
- Additional route helper file: `applications.error-mapping.ts` (non-procedure utility)

### 3.1 Service Domains

`admin`, `applications`, `assistant`, `companies`, `departments`, `documents`, `interviews`, `matching`, `messages`, `notifications`, `offers`, `placements`, `skills`, `stats`, `students`, `universities`, `uploads`, `users`

### 3.2 oRPC Namespaces and Procedure Counts

| Namespace | Procedures |
|---|---:|
| `users` | 7 |
| `companies` | 18 |
| `skills` | 2 |
| `students` | 4 |
| `offers` | 15 |
| `applications` | 10 |
| `matching` | 4 |
| `placements` | 4 |
| `deptHead` | 3 |
| `departments` | 9 |
| `documents` | 7 |
| `notifications` | 5 |
| `interviews` | 4 |
| `messages` | 6 |
| `studentCv` | 9 |
| `stats` | 2 |
| `adminUsers` | 11 |
| `universities` | 7 |
| `assistant` | 9 |
| **Total** | **136** |

## 4. Core Data Flow

### 4.1 Client Components

- Query/mutation layer: TanStack Query + oRPC client from `src/server/orpc/client.ts`
- Typical path:
  1. UI triggers query or mutation
  2. Request hits `/api/rpc/[...rest]`
  3. Middleware resolves session/role/rate-limit context
  4. Procedure calls service function
  5. Service returns typed result or throws typed `ServiceError`

### 4.2 Server Components (RSC)

- Can call service functions directly (no RPC transport) for server-only rendering paths.

## 5. Auth and Authorization

Roles:
- `student`
- `company_admin`
- `dept_head`
- `university_admin`
- `super_admin`

Procedure chain lives in `src/server/orpc/middleware.ts`:
- `publicProcedure`
- `authedProcedure`
- `adminProcedure`
- `superAdminProcedure`
- `companyAdminProcedure`
- `studentProcedure`
- `deptHeadProcedure`

## 6. Guardrails and Enforcement

### 6.1 API Protection

- CSRF protection is enforced on oRPC transport in `src/app/api/rpc/[...rest]/route.ts`.
- Rate-limit presets are centralized in `src/server/orpc/rate-limited-procedures.ts` (20 pre-composed variants).

### 6.2 Lint and Architecture Guards

From `package.json` scripts:

- `bun run lint` = `lint:biome` + `lint:imports` + `lint:next-parity`
- `bun run lint:architecture` runs `scripts/check-feature-folder.cjs`
  - `MAX_STANDALONE_LINES = 150`
  - `MAX_ORCHESTRATOR_LINES = 120`
  - `MAX_SECTION_LINES = 200`
  - Applies to client components under `src/app/**/_components/**` with a legacy exemption allowlist
- `bun run lint:rtl-logical` runs `scripts/check-rtl-logical.cjs`
  - Scans `src/components/ui/{field,sidebar,sheet,drawer}.tsx`
  - Rejects physical-direction Tailwind utilities
- `bun run lint:imports` runs `scripts/check-import-aliases.cjs`
  - Rejects relative imports in `src/**/*.{ts,tsx}`
  - Requires `@/` aliases (style imports are exempt)

## 7. Testing Architecture

- Unit/API/page segmented runs use `scripts/run-tests-isolated.cjs`
  - Finds `*.test.ts(x)` recursively in provided roots
  - Dedupe + sort + run one file per `bun test` process
- Coverage run uses `scripts/run-coverage.cjs`
  - Executes segmented coverage and writes reports under `coverage/*.txt`
- E2E uses Playwright:
  - `bun test:e2e` sets `PLAYWRIGHT_REUSE_SERVER=1`, `E2E_DISABLE_CAPTCHA=1`, and loads `.env.development`

## 8. Storage Implementation

`src/server/storage/s3.ts` uses `@aws-sdk/client-s3` with S3-compatible endpoints.

Supported env key styles:
- Primary: `S3_BUCKET`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL`
- Alternate: `S3_BUCKET_NAME`, `NEXT_PUBLIC_S3_ENDPOINT`, `NEXT_PUBLIC_S3_URL`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

## 9. Documentation Sync Contract

When architecture changes, update together:

1. `ARCHITECTURE.md` (this root snapshot)
2. `docs/ARCHITECTURE.md` (deep-dive architecture handbook)
3. `AGENTS.md` (agent coding rules and architecture constraints)
4. `CLAUDE.md` (Claude-specific guidance)
5. `README.md` (public/high-level summary)
