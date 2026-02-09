import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import { sql } from "drizzle-orm"

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
      console.info(`Dropped type: ${type.typname}`)
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
      console.info(`Dropped table: ${table.table_name}`)
    }

    console.info("Database reset successfully: all tables and types dropped")
  } catch (error) {
    console.error("Error resetting database:", error)
    throw error
  } finally {
    await client.end({ timeout: 5 })
  }
}

// Only run if executed directly (not imported)
if (import.meta.main) {
  resetDatabase()
    .then(() => {
      console.info("Reset complete")
    })
    .catch((err) => {
      console.error(err)
      process.exitCode = 1
    })
}
