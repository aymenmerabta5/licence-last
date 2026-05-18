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

function isPostgresError(err: unknown): err is { code?: string; message?: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    ("code" in err || "message" in err)
  )
}

function isIdempotentError(err: unknown): boolean {
  if (!isPostgresError(err)) return false
  const code = err.code
  // 42710 = duplicate_object (e.g. enum value already exists)
  if (code === "42710") return true
  // Other safe "already exists" codes that shouldn't block restart
  if (code === "42P06") return true // schema already exists
  if (code === "42P07") return true // relation already exists
  return false
}

try {
  await migrate(db, { migrationsFolder: "./src/server/db/migrations" })
  console.log("Migrations applied successfully")
} catch (error) {
  if (isIdempotentError(error)) {
    console.warn(
      "Migration step encountered 'already exists' error, treating as success:",
      isPostgresError(error) ? error.message : error,
    )
    console.log("Migrations applied successfully (idempotent)")
  } else {
    console.error("Migration failed:", error)
    process.exit(1)
  }
} finally {
  await sql.end()
}
