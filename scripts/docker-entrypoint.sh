#!/bin/sh
set -e

echo "Checking database state..."

# Check if the database has any tables (fresh vs existing)
TABLE_COUNT=$(bun -e "
  const postgres = require('postgres');
  const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
  const [{ count }] = await sql\`SELECT COUNT(*)::int as count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'\`;
  await sql.end();
  console.log(count);
" 2>/dev/null || echo "0")

if [ "$TABLE_COUNT" = "0" ]; then
  echo "Fresh database — pushing full schema..."
  bun run scripts/push-schema.ts
else
  echo "Existing database ($TABLE_COUNT tables) — running migrations..."
  bun run scripts/migrate.ts
fi

if [ "$RUN_SEED" = "true" ]; then
  echo "Seeding database..."
  bun run src/server/db/seed.ts
fi

echo "Starting server..."
exec bun ./server.js
