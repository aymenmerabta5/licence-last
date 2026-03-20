#!/bin/sh
set -e

echo "Running database migrations..."
bun run scripts/migrate.ts

if [ "$RUN_SEED" = "true" ]; then
  echo "Seeding database..."
  bun run src/server/db/seed.ts
fi

echo "Starting server..."
exec bun ./server.js
