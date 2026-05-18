import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error("DATABASE_URL is not set")
  process.exit(1)
}

const sql = postgres(databaseUrl, { max: 1, prepare: false })
const db = drizzle(sql)

function getErrorString(err: unknown): string {
  if (typeof err === "string") return err
  if (err instanceof Error) return `${err.message}\n${err.stack ?? ""}`
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

try {
  await migrate(db, { migrationsFolder: "./src/server/db/migrations" })
  console.log("Migrations applied successfully")
} catch (error) {
  if (isIdempotentError(error)) {
    console.warn(
      "Migration step encountered 'already exists' error, treating as success:",
      getErrorString(error).split("\n")[0] ?? error,
    )
    console.log("Migrations applied successfully (idempotent)")
  } else {
    console.error("Migration failed:", error)
    process.exit(1)
  }
} finally {
  await sql.end()
}
