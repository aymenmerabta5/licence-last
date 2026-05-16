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
                    Better Auth   oRPC   AI Gateway
                           \       |      /
                        +-----------------------+
                        |    Services Layer     |
                        |   Business Logic      |
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
| AI | Single OpenAI-compatible provider + Arcade |
| Email | Resend + React Email |
| Storage | S3-compatible (AWS S3 / Cloudflare R2) |
| i18n | next-intl (English, French, Arabic with full RTL) |
| PDF | @react-pdf/renderer (agreements, certificates) |
| Testing | Bun test runner + Playwright E2E |
| Deployment | Docker + Caddy + GitHub Actions SSH deploy |

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
bun run db:seed        # Seed initial data (skills, universities, optional admin accounts)

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
| `AI_API_KEY` | Primary AI provider key for cover-letter drafting, search copilot, offer copilot, assistant chat, and validation summaries |
| `RESEND_API_KEY`, `EMAIL_FROM` | Transactional email for signup verification, password reset, and 2FA OTP |
| `S3_BUCKET`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL` | Production file storage for company verification docs, avatars, logos, and resumes |

**Optional:**

| Variable | Description |
|----------|-------------|
| `AI_API_KEY`, `AI_MODEL`, `AI_ALLOWED_MODELS`, `AI_BASE_URL` | AI provider configuration (OpenAI-compatible endpoint) |
| `ARCADE_API_KEY` | External AI tools (GitHub, Gmail). Required only when the company assistant is enabled |
| `S3_BUCKET_NAME`, `NEXT_PUBLIC_S3_ENDPOINT`, `NEXT_PUBLIC_S3_URL`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Alternate S3-compatible naming |
| `REDIS_URL`, `REDIS_RATE_LIMIT_ENABLED` | Redis for rate limiting |
| `FEATURE_*`, `NEXT_PUBLIC_FEATURE_*` | Server/client feature flags |
| `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Optional bot protection |
| `LOG_LEVEL` | Pino log level (default: `info`) |

Feature flag defaults:
- `FEATURE_SAVED_OFFERS=true` + `NEXT_PUBLIC_FEATURE_SAVED_OFFERS=true`
- `FEATURE_INTERVIEWS=true` + `NEXT_PUBLIC_FEATURE_INTERVIEWS=true`
- `FEATURE_LANGUAGE_REQUIREMENTS=true` + `NEXT_PUBLIC_FEATURE_LANGUAGE_REQUIREMENTS=true`
- `FEATURE_NOTIF_PREFERENCES=true` + `NEXT_PUBLIC_FEATURE_NOTIF_PREFERENCES=true`
- `FEATURE_COMPANY_ASSISTANT=false` + `NEXT_PUBLIC_FEATURE_COMPANY_ASSISTANT=false` unless Arcade-backed assistant access is explicitly enabled and an AI provider key is configured

See [`.env.example`](.env.example) for the full list, including production Docker variables (`POSTGRES_*`, `GITHUB_REPO`, `DOMAIN_NAME`, `RUN_SEED`, `SEED_ADMIN_*`, `SEED_UNIVERSITY_ADMIN_*`).

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
bun test:coverage      # Coverage run
bun test:e2e           # Playwright E2E (loads .env.e2e; if a dev server is already running, reuse can keep it on your dev DB)
bun test:ci            # CI/unit + integration test pipeline
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
│   │   ├── (authenticated)/   # Role-based dashboards
│   │   └── onboarding/        # Setup wizards per role
│   └── api/
│       ├── auth/[...all]/     # Better Auth endpoints
│       ├── rpc/[...rest]/     # oRPC endpoints
│       ├── assistant/         # AI chat streaming + auth status
│       ├── openapi/           # OpenAPI spec + Swagger UI
│       └── health/            # Dependency-aware readiness check
├── components/                # Shared UI and app components
├── hooks/                     # Shared hooks
├── lib/                       # Schemas, utils, constants, animations
├── server/
│   ├── db/                    # Drizzle schema, migrations, seed
│   ├── orpc/                  # Controller layer
│   ├── services/              # Business logic
│   ├── ai/                    # AI model config, tools, prompts
│   ├── openapi/               # OpenAPI spec generation
│   ├── pdfs/                  # PDF templates
│   ├── email/                 # Resend + React Email templates
│   ├── storage/               # S3-compatible storage wrapper
│   ├── caching/               # Redis client + rate limiter
│   └── logging/               # Pino structured logging
├── i18n/                      # next-intl config
└── messages/                  # Translation files
```

## Architecture

The project follows an **MVC pattern**:

- **Model** (`server/services/`) — pure business logic with `import "server-only"`
- **Controller** (`server/orpc/`) — oRPC procedures with auth middleware and rate limiting
- **View** — React Server Components + Client Components with feature folder pattern

Operational contracts:
- Services throw typed `ServiceError` codes for domain failures.
- Route handlers map service errors to transport-safe `ORPCError` via `createServiceORPCError`.
- `/api/health` returns per-dependency readiness (`database`, `redis`, `rateLimiter`) and returns `503` when required dependencies are down.

### Auth & Roles

5 roles enforced via middleware chain: `student`, `company_admin`, `university_admin`, `super_admin`, plus `dept_head` (legacy; new department heads are `university_admin` users with a `department_head` membership in the `university_member` table).

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
- Public verification page under locale routes (for example `/en/verify`) — anyone can verify a document's authenticity
- No authentication required for verification

### AI Assistant

Role-based copilot with a single OpenAI-compatible provider:

- **Company Copilot**: Full conversational chat with persistence
- **Student Copilot**: Intent-specific one-off calls only (search parsing, cover letter drafting) — no persistent conversation CRUD
- **Admin Copilot**: Intent-specific one-off calls only (validation summaries) — no persistent conversation CRUD
- Server-side tools for drafting, summarization, and workflow assistance
- Arcade integration for external tools such as GitHub and Gmail
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

Single-server deployment with Docker Compose, Caddy (auto-HTTPS), and GitHub Actions deploying exact GHCR image digests over SSH.

```bash
# On your VPS
mkdir -p /root/stag && cd /root/stag
# Copy docker-compose.prod.yml, Caddyfile, .env
nano .env  # Set APP_IMAGE, auth, database, and domain values

# First deploy (with seeding)
RUN_SEED=true docker compose -f docker-compose.prod.yml up -d
```

**Auto-deploy pipeline**: A successful CI run on `main` or `master` triggers CD. CI runs lint, typecheck, tests, Playwright E2E, and build; CD then builds and pushes a Docker image to GHCR, updates `APP_IMAGE` on the VPS to the exact image digest it just built, and recreates `app` + `caddy` over SSH.

Memory budget for a 2GB server: PostgreSQL 384MB, Next.js 512MB, Redis 64MB, Caddy 64MB, Backup 64MB.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full guide.

## Documentation

| Document | Description |
|----------|-------------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Full system architecture snapshot |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Server setup, Docker Compose, Caddy, and GitHub Actions deploy guide |
| [CLAUDE.md](CLAUDE.md) | Project conventions and patterns for Claude Code |
| [AGENTS.md](AGENTS.md) | Agent instructions and codebase reference |

> **Note:** When adding features, keep `README.md`, `AGENTS.md`, `CLAUDE.md`, and the docs under `docs/` in sync.

## License

Private project.
