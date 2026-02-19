import { sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import { logger } from "@/server/logging/logger"

async function resetDatabase() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required")
  }

  const client = postgres(databaseUrl, { max: 1 })
  const db = drizzle(client)

  try {
    const typesResult = await db.execute<{ typname: string }>(sql`
      SELECT typname
      FROM pg_type
      WHERE typtype = 'e'
      AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    `)
    for (const type of typesResult) {
      await db.execute(
        sql`DROP TYPE IF EXISTS "${sql.raw(type.typname)}" CASCADE;`,
      )
      logger.info({ event: "type_dropped", type: type.typname })
    }

    const tablesResult = await db.execute<{ table_name: string }>(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE';
    `)

    for (const table of tablesResult) {
      await db.execute(
        sql`DROP TABLE IF EXISTS "${sql.raw(table.table_name)}" CASCADE;`,
      )
      logger.info({ event: "table_dropped", table: table.table_name })
    }

    logger.info({ event: "reset_complete" }, "Database reset successfully")
  } catch (error) {
    logger.error(
      { err: error, event: "reset_error" },
      "Error resetting database",
    )
    throw error
  } finally {
    await client.end({ timeout: 5 })
  }
}

// Only run if executed directly (not imported)
if (import.meta.main) {
  resetDatabase()
    .then(() => {
      logger.info({ event: "reset_complete" })
    })
    .catch((err) => {
      logger.error({ err, event: "reset_failed" }, "Database reset failed")
      process.exitCode = 1
    })
}
