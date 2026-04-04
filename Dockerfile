# -----------------------------------------------------------------------------
# Multi-stage Bun Dockerfile for Stag
# Stages: base → deps → builder → runner
# -----------------------------------------------------------------------------

FROM oven/bun:1 AS base
WORKDIR /app

# --- Install dependencies ---
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --no-save --frozen-lockfile

# --- Build the application ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure public/ exists (Next.js standalone output expects it)
RUN mkdir -p public

# Build-time env values are required for T3 Env validation during `next build`.
# These are safe defaults; provide real values at runtime via .env on the server.
ARG NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY=
ARG NEXT_PUBLIC_FEATURE_NOTIF_PREFERENCES=true
ARG NEXT_PUBLIC_FEATURE_SAVED_OFFERS=true
ARG NEXT_PUBLIC_FEATURE_INTERVIEWS=true
ARG NEXT_PUBLIC_FEATURE_LANGUAGE_REQUIREMENTS=true
ARG FEATURE_COMPANY_ASSISTANT=false
ARG NEXT_PUBLIC_FEATURE_COMPANY_ASSISTANT=false
ARG AI_API_KEY=build-ai-api-key
ARG RESEND_API_KEY=build-resend-api-key
ARG EMAIL_FROM=build@local.test
ARG S3_BUCKET=build-bucket
ARG S3_ACCESS_KEY_ID=build-access-key
ARG S3_SECRET_ACCESS_KEY=build-secret-key
ARG S3_PUBLIC_URL=
ARG NEXT_PUBLIC_S3_URL=
ARG S3_ENDPOINT=
ARG NEXT_PUBLIC_S3_ENDPOINT=
RUN DATABASE_URL=postgresql://postgres:postgres@localhost:5432/stag \
    BETTER_AUTH_SECRET=build-secret-not-for-production-use \
    NEXT_PUBLIC_BETTER_AUTH_URL=$NEXT_PUBLIC_BETTER_AUTH_URL \
    NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY \
    NEXT_PUBLIC_FEATURE_NOTIF_PREFERENCES=$NEXT_PUBLIC_FEATURE_NOTIF_PREFERENCES \
    NEXT_PUBLIC_FEATURE_SAVED_OFFERS=$NEXT_PUBLIC_FEATURE_SAVED_OFFERS \
    NEXT_PUBLIC_FEATURE_INTERVIEWS=$NEXT_PUBLIC_FEATURE_INTERVIEWS \
    NEXT_PUBLIC_FEATURE_LANGUAGE_REQUIREMENTS=$NEXT_PUBLIC_FEATURE_LANGUAGE_REQUIREMENTS \
    FEATURE_COMPANY_ASSISTANT=$FEATURE_COMPANY_ASSISTANT \
    NEXT_PUBLIC_FEATURE_COMPANY_ASSISTANT=$NEXT_PUBLIC_FEATURE_COMPANY_ASSISTANT \
    AI_API_KEY=$AI_API_KEY \
    RESEND_API_KEY=$RESEND_API_KEY \
    EMAIL_FROM=$EMAIL_FROM \
    S3_BUCKET=$S3_BUCKET \
    S3_ACCESS_KEY_ID=$S3_ACCESS_KEY_ID \
    S3_SECRET_ACCESS_KEY=$S3_SECRET_ACCESS_KEY \
    S3_PUBLIC_URL=$S3_PUBLIC_URL \
    NEXT_PUBLIC_S3_URL=$NEXT_PUBLIC_S3_URL \
    S3_ENDPOINT=$S3_ENDPOINT \
    NEXT_PUBLIC_S3_ENDPOINT=$NEXT_PUBLIC_S3_ENDPOINT \
    bun run build

# --- Production runner ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0" \
    NODE_OPTIONS="--max-old-space-size=384"

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --no-log-init -g nodejs nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy migration files and scripts for runtime migrations
COPY --from=builder --chown=nextjs:nodejs /app/src/server/db/migrations ./src/server/db/migrations
COPY --from=builder --chown=nextjs:nodejs /app/src/server/db/seed.ts ./src/server/db/seed.ts
COPY --from=builder --chown=nextjs:nodejs /app/scripts/migrate.ts ./scripts/migrate.ts

# Copy runtime dependencies needed for migrations/seed
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/drizzle-orm ./node_modules/drizzle-orm
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/postgres ./node_modules/postgres

# Copy entrypoint script
COPY --from=builder --chown=nextjs:nodejs /app/scripts/docker-entrypoint.sh ./scripts/docker-entrypoint.sh
RUN chmod +x ./scripts/docker-entrypoint.sh

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

ENTRYPOINT ["./scripts/docker-entrypoint.sh"]
