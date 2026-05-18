#!/bin/sh
set -e

echo "[entrypoint] ===================================="
echo "[entrypoint] Starting Stag.io application"
echo "[entrypoint] ===================================="

# Validate critical runtime env vars
if [ -z "$DATABASE_URL" ]; then
  echo "[entrypoint] FATAL: DATABASE_URL is not set" >&2
  exit 1
fi

if [ -z "$BETTER_AUTH_SECRET" ]; then
  echo "[entrypoint] FATAL: BETTER_AUTH_SECRET is not set" >&2
  exit 1
fi

echo "[entrypoint] Step 1/3 — Applying database migrations..."
bun run scripts/migrate.ts
if [ $? -ne 0 ]; then
  echo "[entrypoint] FATAL: Migration failed. Aborting startup." >&2
  exit 1
fi

echo "[entrypoint] Step 2/3 — Seeding database (if enabled)..."
if [ "$RUN_SEED" = "true" ]; then
  echo "[entrypoint]   -> Running base seed..."
  bun run src/server/db/seed.ts
fi

if [ "$SEED_DEMO" = "true" ]; then
  echo "[entrypoint]   -> Running demo seed..."
  bun run src/server/db/seed-demo.ts
fi

echo "[entrypoint] Step 3/3 — Starting Next.js server..."
exec bun ./server.js
