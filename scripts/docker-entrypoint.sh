#!/bin/sh
set -e

echo "Running database schema setup..."
bun run scripts/migrate.ts

if [ "$RUN_SEED" = "true" ]; then
  echo "Seeding database..."
  bun run src/server/db/seed.ts
fi

if [ "$SEED_DEMO" = "true" ]; then
  echo "Running comprehensive demo seed..."
  bun run src/server/db/seed-demo.ts
fi

echo "Starting server..."
exec bun ./server.js
