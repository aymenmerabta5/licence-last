#!/bin/sh
set -e

echo "Running database migrations..."
bunx drizzle-kit migrate

if [ "$RUN_SEED" = "true" ]; then
  echo "Seeding database..."
  bun run src/server/db/seed.ts
fi

echo "Starting server..."
exec bun ./server.js
