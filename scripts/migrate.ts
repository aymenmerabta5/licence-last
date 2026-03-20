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

try {
  await migrate(db, { migrationsFolder: "./src/server/db/migrations" })
  console.log("Migrations applied successfully")
} catch (error) {
  console.error("Migration failed:", error)
  process.exit(1)
} finally {
  await sql.end()
}
