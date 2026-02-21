# Stag

A full-stack platform connecting Algerian companies with university students for internships. Built with Next.js 16, React 19, and an editorial "Morning Press / Night Edition" design aesthetic.

## Overview

Stag manages the complete internship lifecycle:

- **Students** discover offers, apply, track applications, and get AI-powered cover letter help
- **Companies** post offers, manage candidate pipelines, and use an AI assistant for recruitment
- **Department heads** validate placements for their department's students
- **University admins** manage departments (CRUD, bulk import, skills, head assignment by email), validate placements, and generate official documents (agreements, certificates)
- **Super admins** manage the entire platform: users, companies, universities, departments

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

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun |
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 + shadcn/ui |
| API | oRPC (type-safe RPC) + TanStack Query |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Better Auth (2FA, multi-session, role-based) |
| AI | Poe (OpenAI-compatible) + Arcade (GitHub, Gmail) |
| Email | Resend + React Email |
| Storage | S3-compatible (AWS S3 / Cloudflare R2) |
| i18n | next-intl (English, French, Arabic with full RTL) |
| PDF | @react-pdf/renderer (agreements, certificates) |
| Testing | Bun test runner + Playwright E2E |
| Deployment | Docker + Caddy + Watchtower (auto-deploy) |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) 1.x
- PostgreSQL 16+

### Setup

```bash
# Clone and install
git clone <repo-url>
cd stag
bun install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL, BETTER_AUTH_SECRET, etc.

# Set up database
bun run db:push        # Push schema to database
bun run db:seed        # Seed initial data (44 skill tags, universities, optional admin)

# Start development
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

**Required:**

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Auth encryption key (min 32 chars) |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Public app URL (e.g., `http://localhost:3000`) |

**Optional:**

| Variable | Description |
|----------|-------------|
| `POE_API_KEY`, `POE_MODEL`, `POE_BASE_URL` | AI assistant provider |
| `ARCADE_API_KEY` | External AI tools (GitHub, Gmail) |
| `RESEND_API_KEY`, `EMAIL_FROM` | Email service |
| `S3_BUCKET`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | File storage |
| `S3_BUCKET_NAME`, `NEXT_PUBLIC_S3_ENDPOINT`, `NEXT_PUBLIC_S3_URL`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Alternate S3-compatible naming |
| `REDIS_URL`, `REDIS_RATE_LIMIT_ENABLED` | Redis for rate limiting |
| `FEATURE_*`, `NEXT_PUBLIC_FEATURE_*` | Server/client feature flags |
| `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Optional bot protection |
| `LOG_LEVEL` | Pino log level (default: `info`) |

Feature flag defaults:
- `FEATURE_SAVED_OFFERS=true` + `NEXT_PUBLIC_FEATURE_SAVED_OFFERS=true`
- `FEATURE_INTERVIEWS=false` + `NEXT_PUBLIC_FEATURE_INTERVIEWS=false`
- `FEATURE_LANGUAGE_REQUIREMENTS=false` + `NEXT_PUBLIC_FEATURE_LANGUAGE_REQUIREMENTS=false`
- `FEATURE_NOTIF_PREFERENCES=false` + `NEXT_PUBLIC_FEATURE_NOTIF_PREFERENCES=false`

See [`.env.example`](.env.example) for the full list, including production Docker variables (`POSTGRES_*`, `GITHUB_REPO`, `DOMAIN_NAME`, `RUN_SEED`, `SEED_ADMIN_*`).

## Scripts

```bash
# Development
bun run dev            # Start dev server
bun run build          # Production build
bun run start          # Start production server
bun run lint           # Biome lint + import alias + Next parity checks
bun run lint:biome     # Biome lint only
bun run lint:fix       # Biome autofix (lint + format)
bun run format         # Biome format only
bun run lint:imports   # Import/layer lint sweep
bun run lint:next-parity # Next parity guard (img/link)
bun run lint:architecture # Feature-folder architecture guard
bun run lint:rtl-logical  # RTL logical CSS guard
bun run typecheck      # TypeScript check
bun run mcp:dev        # MCP development server (uses .env.development)

# Testing
bun test               # All tests
bun test:watch         # Watch mode
bun test:unit          # Unit/core tests (lib + service/data/core server modules)
bun test:orpc-routes   # oRPC controller route and smoke tests
bun test:api:app-routes # App Router API route tests only
bun test:api           # API route tests + oRPC route suite
bun test:pages         # App Router page/component tests (src/app/[locale])
bun test:coverage      # Segmented coverage run; writes reports to coverage/*.txt
bun test:e2e           # Playwright E2E (sets PLAYWRIGHT_REUSE_SERVER=1, E2E_DISABLE_CAPTCHA=1, and loads .env.development)
bun test:ci            # CI pipeline (unit + api + pages)
bun run check:all      # Full pre-release checks (lint, typecheck, tests, build)

# Database
bun run db:generate    # Generate Drizzle migrations
bun run db:migrate     # Run migrations
bun run db:push        # Push schema (no migration files)
bun run db:studio      # Open Drizzle Studio
bun run db:seed        # Seed data
bun run db:reset       # Reset database
# Append :prod for production (e.g., db:migrate:prod)
```

## Project Structure

```
src/
├── app/
│   ├── [locale]/              # i18n routes (en, fr, ar)
│   │   ├── (auth)/            # Login, signup, reset-password
│   │   ├── (authenticated)/   # Dashboard (role-based)
│   │   │   └── dashboard/     # 47 pages across student/company/admin/dept-head
│   │   └── onboarding/        # Setup wizards per role
│   └── api/
│       ├── auth/[...all]/     # Better Auth endpoints
│       ├── rpc/[...rest]/     # oRPC (136 procedures, CSRF protected)
│       ├── assistant/         # AI chat streaming + auth status
│       ├── openapi/           # OpenAPI spec + Swagger UI
│       └── health/            # Dependency-aware readiness check
├── components/                # Shared UI (28 shadcn/ui primitives + custom)
├── hooks/                     # Shared hooks (useDebounce, useInfiniteScroll, useCopilot, etc.)
├── lib/                       # Schemas, utils, constants, animations
├── server/
│   ├── db/                    # Drizzle schema (19 modules) + migrations + seed
│   ├── orpc/                  # Controller layer (18 route modules, 20 rate-limit variants)
│   ├── services/              # Model layer (18 business domains)
│   ├── ai/                    # AI model config, tools, prompts, personas
│   ├── openapi/               # OpenAPI spec generation
│   ├── pdfs/                  # PDF templates (agreements, certificates)
│   ├── email/                 # Resend + React Email templates
│   ├── storage/               # AWS SDK S3-compatible client wrapper
│   ├── caching/               # Redis client + rate limiter
│   └── logging/               # Pino structured logging (auto-redacts PII)
├── i18n/                      # next-intl config
└── messages/                  # Translation files (~1,200 lines each)
```

## Architecture

The project follows an **MVC pattern**:

- **Model** (`server/services/`) — 18 domains of pure business logic with `import "server-only"`
- **Controller** (`server/orpc/`) — 136 oRPC procedures across 19 namespaces with auth middleware and rate limiting
- **View** — React Server Components + Client Components with feature folder pattern

Operational contracts:
- Services throw typed `ServiceError` codes for domain failures.
- Route handlers map service errors to transport-safe `ORPCError` via `createServiceORPCError`.
- `/api/health` returns per-dependency readiness (`database`, `redis`, `rateLimiter`) and returns `503` when required dependencies are down.

### Auth & Roles

5 roles enforced via middleware chain: `student`, `company_admin`, `dept_head`, `university_admin`, `super_admin`

- Email verification required on signup
- 2FA support: TOTP, OTP (email), backup codes
- Multi-session management (max 5 concurrent)
- University email domain validation for student registration
- User banning (temporary and permanent)
- Admin impersonation with audit trail
- Department management: CRUD, bulk import, skills, head assign/unassign by email (auto-creates users)

### Document Verification

Public verification system for internship documents:
- Each generated agreement/certificate gets a unique verification code + QR code
- Public verification page at `/verify` — anyone can verify a document's authenticity
- No authentication required for verification

### AI Assistant

Role-based copilot powered by Poe (OpenAI-compatible):

- **3 personas**: Student, Company, Admin (context-injected per role)
- **9 internal tools**: offer drafting, candidate summarization, cover letter generation, search parsing, notification summaries, and more
- **Arcade integration**: GitHub and Gmail external tools for company admins
- Context minimization with PII redaction

### Matching System

Student-offer scoring algorithm (v1.0.0):

| Factor | Weight | Method |
|--------|--------|--------|
| Skills | 55% | Matched / required skills ratio |
| Language | 20% | CEFR proficiency levels (A1-C2, native) |
| Location | 15% | Wilaya match + work mode (remote/hybrid/on-site) |
| Profile | 10% | Completeness signals (bio, GitHub, phone, etc.) |

Includes skill gap roadmap and readiness history tracking over time.

### Trust Index

Company reputation scoring:

- Response rate (30%) + Completion rate (30%) + Feedback score (30%) - Report penalties (up to -40)
- Tiers: Excellent (80+), Good (65-79), Watch (45-64), Low (<45)

### Design System

Editorial "Morning Press / Night Edition" aesthetic:

- **Fonts**: DM Serif Display (headlines), DM Sans (body), Noto Sans Arabic (RTL)
- **Colors**: OkLch color space, warm parchment/ink palette
- **Themes**: Light (parchment) and Dark (deep warm ink)
- **Animations**: Shared `reveal` + `ease` patterns via motion/react-client
- **RTL**: Full Arabic support with Tailwind logical CSS properties (ms/me/ps/pe/start/end)

## Deployment

Single-server deployment with Docker Compose, Caddy (auto-HTTPS), and Watchtower (auto-deploy from GHCR).

```bash
# On your VPS
mkdir -p /opt/stag && cd /opt/stag
# Copy docker-compose.prod.yml, Caddyfile, .env
nano .env  # Set DATABASE_URL, BETTER_AUTH_SECRET, DOMAIN_NAME, etc.

# First deploy (with seeding)
RUN_SEED=true docker compose -f docker-compose.prod.yml up -d
```

**Auto-deploy pipeline**: Push to `master` triggers CI (lint, typecheck, unit/api/pages tests, coverage guard, build, E2E), then CD builds and pushes a Docker image to GHCR. Watchtower detects the new image within 60 seconds and restarts the app.

Memory budget for a 2GB server: PostgreSQL 384MB, Next.js 512MB, Redis 64MB, Caddy 64MB, Watchtower 64MB.

See [docs/DEPLOYMENT_INCHALLAH.md](docs/DEPLOYMENT_INCHALLAH.md) for the full guide.

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Full system architecture snapshot (kept in sync with `docs/ARCHITECTURE.md`) |
| [DEPLOYMENT_INCHALLAH.md](docs/DEPLOYMENT_INCHALLAH.md) | Server setup, Docker Compose, Caddy, Watchtower guide |
| [CLAUDE.md](CLAUDE.md) | Project conventions and patterns for Claude Code |
| [AGENTS.md](AGENTS.md) | Agent instructions and codebase reference |

> **Note:** When adding features, sync `README.md`, `AGENTS.md`, `CLAUDE.md`, `ARCHITECTURE.md`, and `docs/ARCHITECTURE.md`. See the "Documentation Sync Policy" sections for the checklist.

## License

Private project.
