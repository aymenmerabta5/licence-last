import { existsSync } from "node:fs"
import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"

const MIGRATIONS_FOLDER = "./src/server/db/migrations"

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error("[migrate] FATAL: DATABASE_URL is not set")
  process.exit(1)
}

if (!existsSync(MIGRATIONS_FOLDER)) {
  console.error(
    `[migrate] FATAL: Migrations folder not found: ${MIGRATIONS_FOLDER}`,
  )
  process.exit(1)
}

const sql = postgres(databaseUrl, { max: 1, prepare: false })
const db = drizzle(sql)

function getErrorString(err: unknown): string {
  if (typeof err === "string") return err
  if (err instanceof Error) return `${err.name}: ${err.message}`
  try {
    return JSON.stringify(err)
  } catch {
    return String(err)
  }
}

function getPostgresCode(err: unknown): string | undefined {
  let current: unknown = err
  while (current && typeof current === "object") {
    if ("code" in current) {
      return String((current as Record<string, unknown>).code)
    }
    if ("cause" in current) {
      current = (current as Record<string, unknown>).cause
    } else {
      break
    }
  }
  return undefined
}

function isIdempotentError(err: unknown): boolean {
  const text = getErrorString(err)
  const code = getPostgresCode(err)
  // Safe "already exists" codes that shouldn't block restart when a
  // previous migration run crashed before Drizzle could write the journal.
  const safeCodes = [
    "42710", // duplicate_object (enum value already exists)
    "42P06", // schema already exists
    "42P07", // relation (table) already exists
    "42701", // column already exists
    "42P16", // table already has column
  ]
  return safeCodes.some(
    (safeCode) =>
      code === safeCode ||
      text.includes(`"${safeCode}"`) ||
      text.includes(safeCode),
  )
}

async function testConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`
    return true
  } catch (err) {
    console.error(
      "[migrate] FATAL: Cannot connect to database:",
      getErrorString(err),
    )
    return false
  }
}

async function runMigrations() {
  const connected = await testConnection()
  if (!connected) {
    process.exit(1)
  }

  try {
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER })
    console.log("[migrate] All migrations applied successfully")
  } catch (error) {
    const code = getPostgresCode(error)
    if (isIdempotentError(error)) {
      console.warn(
        `[migrate] Caught idempotent error (code: ${code ?? "unknown"})`,
        "- treating as success.",
      )
      console.log("[migrate] Migrations applied successfully (idempotent)")
    } else {
      console.error(`[migrate] FATAL: Migration failed (code: ${code ?? "unknown"})`)
      console.error("[migrate] Details:", getErrorString(error))
      process.exit(1)
    }
  } finally {
    await sql.end()
  }
}

runMigrations()
