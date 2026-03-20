import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error("DATABASE_URL is not set")
  process.exit(1)
}

const sql = postgres(databaseUrl, { max: 1, prepare: false })

try {
  // Read and execute each migration file in order, ignoring "already exists" errors
  const fs = await import("node:fs")
  const path = await import("node:path")
  const crypto = await import("node:crypto")

  const migrationsDir = "./src/server/db/migrations"
  const journal = JSON.parse(
    fs.readFileSync(path.join(migrationsDir, "meta/_journal.json"), "utf8"),
  )

  // Ensure drizzle schema and migrations table exist
  await sql`CREATE SCHEMA IF NOT EXISTS drizzle`
  await sql`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash TEXT NOT NULL,
      created_at BIGINT
    )
  `

  // Check which migrations are already applied
  const applied = await sql`SELECT hash FROM drizzle.__drizzle_migrations`
  const appliedHashes = new Set(applied.map((r) => (r as Record<string, unknown>).hash as string))

  for (const entry of journal.entries) {
    const filePath = path.join(migrationsDir, `${entry.tag}.sql`)
    const content = fs.readFileSync(filePath, "utf8")
    const hash = crypto.createHash("sha256").update(content).digest("hex")

    if (appliedHashes.has(hash)) {
      console.log(`  ✓ ${entry.tag} (already applied)`)
      continue
    }

    // Split by statement breakpoint and execute each statement
    const statements = content.split("--> statement-breakpoint").map((s: string) => s.trim()).filter(Boolean)

    for (const stmt of statements) {
      try {
        await sql.unsafe(stmt)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        // Ignore "already exists" errors — safe on fresh + partial state
        if (msg.includes("already exists")) {
          continue
        }
        throw err
      }
    }

    // Record migration as applied
    await sql`
      INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
      VALUES (${hash}, ${entry.when})
    `
    console.log(`  ✓ ${entry.tag}`)
  }

  console.log("Schema push complete")
} catch (error) {
  console.error("Schema push failed:", error)
  process.exit(1)
} finally {
  await sql.end()
}
