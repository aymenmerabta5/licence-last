import { stdin, stdout } from "node:process"
import { createInterface } from "node:readline/promises"

import { sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import { getMaintenancePostgresOptions } from "@/server/db/postgres-options"
import { logger } from "@/server/logging/logger"

const REQUIRE_PRODUCTION_CONFIRMATION_FLAG = "--require-production-confirmation"
const PRODUCTION_RESET_CONFIRMATION_PHRASE = "RESET PRODUCTION DATABASE"

function getDatabaseIdentifier(databaseUrl: string) {
  try {
    const parsedUrl = new URL(databaseUrl)
    const databaseName = parsedUrl.pathname.replace(/^\//, "") || "<unknown>"
    return `${parsedUrl.host}/${databaseName}`
  } catch {
    return "<invalid DATABASE_URL>"
  }
}

async function confirmProductionReset(databaseUrl: string) {
  if (!stdin.isTTY || !stdout.isTTY) {
    throw new Error(
      "Production reset requires an interactive terminal confirmation.",
    )
  }

  const target = getDatabaseIdentifier(databaseUrl)
  logger.warn(
    { event: "reset_prod_confirmation_required", target },
    "Production reset confirmation required",
  )

  stdout.write(
    `\nDANGER: this will permanently remove all public tables and enum types for ${target}.\n`,
  )

  const readline = createInterface({ input: stdin, output: stdout })
  try {
    const confirmation = (
      await readline.question(
        `Type "${PRODUCTION_RESET_CONFIRMATION_PHRASE}" to continue: `,
      )
    ).trim()

    if (confirmation !== PRODUCTION_RESET_CONFIRMATION_PHRASE) {
      throw new Error("Confirmation phrase mismatch. Production reset aborted.")
    }

    logger.info({ event: "reset_prod_confirmation_matched", target })
  } finally {
    readline.close()
  }
}

interface ResetDatabaseOptions {
  requireProductionConfirmation?: boolean
}

async function resetDatabase(options: ResetDatabaseOptions = {}) {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required")
  }

  if (options.requireProductionConfirmation) {
    await confirmProductionReset(databaseUrl)
  }

  const client = postgres(databaseUrl, getMaintenancePostgresOptions())
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
  const requireProductionConfirmation = process.argv.includes(
    REQUIRE_PRODUCTION_CONFIRMATION_FLAG,
  )

  resetDatabase({ requireProductionConfirmation })
    .then(() => {
      logger.info({ event: "reset_complete" })
    })
    .catch((err) => {
      logger.error({ err, event: "reset_failed" }, "Database reset failed")
      process.exitCode = 1
    })
}
