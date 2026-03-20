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
RUN DATABASE_URL=postgresql://postgres:postgres@localhost:5432/stag \
    BETTER_AUTH_SECRET=build-secret-not-for-production-use \
    NEXT_PUBLIC_BETTER_AUTH_URL=$NEXT_PUBLIC_BETTER_AUTH_URL \
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

# Copy migration files + drizzle config for runtime migrations
COPY --from=builder --chown=nextjs:nodejs /app/src/server/db/migrations ./src/server/db/migrations
COPY --from=builder --chown=nextjs:nodejs /app/src/server/db/schema ./src/server/db/schema
COPY --from=builder --chown=nextjs:nodejs /app/src/server/db/seed.ts ./src/server/db/seed.ts
COPY --from=builder --chown=nextjs:nodejs /app/drizzle.config.ts ./drizzle.config.ts

# Copy entrypoint script
COPY --from=builder --chown=nextjs:nodejs /app/scripts/docker-entrypoint.sh ./scripts/docker-entrypoint.sh
RUN chmod +x ./scripts/docker-entrypoint.sh

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

ENTRYPOINT ["./scripts/docker-entrypoint.sh"]
