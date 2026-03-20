import postgres from "postgres"

interface MigrationEntry {
  idx: number
  version: string
  when: number
  tag: string
  breakpoints: boolean
}

interface MigrationJournal {
  entries: MigrationEntry[]
}

interface PreparedMigration extends MigrationEntry {
  hash: string
  statements: string[]
}

interface PostgresLikeError extends Error {
  code?: string
}

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error("DATABASE_URL is not set")
  process.exit(1)
}

const sql = postgres(databaseUrl, { max: 1, prepare: false })
const RETRYABLE_DEPENDENCY_ERROR_CODES = new Set(["42P01", "42704"])

function isAlreadyExistsError(message: string): boolean {
  return message.includes("already exists")
}

function isRetryableDependencyError(error: unknown): boolean {
  const code = (error as PostgresLikeError | undefined)?.code
  return typeof code === "string" && RETRYABLE_DEPENDENCY_ERROR_CODES.has(code)
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function getStatementPreview(statement: string): string {
  return statement.replace(/\s+/g, " ").slice(0, 200)
}

async function ensureMigrationsTable(): Promise<void> {
  await sql`CREATE SCHEMA IF NOT EXISTS drizzle`
  await sql`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash TEXT NOT NULL,
      created_at BIGINT
    )
  `
}

async function getAppliedHashes(): Promise<Set<string>> {
  const applied = await sql`SELECT hash FROM drizzle.__drizzle_migrations`

  return new Set(
    applied.map((row) => (row as Record<string, unknown>).hash as string),
  )
}

async function recordMigration(hash: string, createdAt: number): Promise<void> {
  await sql`
    INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
    VALUES (${hash}, ${createdAt})
  `
}

async function runMigrationStatements(
  migration: PreparedMigration,
): Promise<void> {
  for (const statement of migration.statements) {
    try {
      await sql.unsafe(statement)
    } catch (error: unknown) {
      const message = getErrorMessage(error)

      if (isAlreadyExistsError(message)) {
        continue
      }

      if (isRetryableDependencyError(error)) {
        throw error
      }

      console.error(
        `Migration ${migration.tag} failed while executing: ${getStatementPreview(statement)}`,
      )
      throw error
    }
  }
}

try {
  // Read and execute each migration file in order, ignoring "already exists" errors
  const fs = await import("node:fs")
  const path = await import("node:path")
  const crypto = await import("node:crypto")

  const migrationsDir = "./src/server/db/migrations"
  const journal = JSON.parse(
    fs.readFileSync(path.join(migrationsDir, "meta/_journal.json"), "utf8"),
  ) as MigrationJournal

  await ensureMigrationsTable()

  const appliedHashes = await getAppliedHashes()
  const pendingMigrations: PreparedMigration[] = []

  for (const entry of journal.entries) {
    const filePath = path.join(migrationsDir, `${entry.tag}.sql`)
    const content = fs.readFileSync(filePath, "utf8")
    const hash = crypto.createHash("sha256").update(content).digest("hex")

    if (appliedHashes.has(hash)) {
      console.log(`  ✓ ${entry.tag} (already applied)`)
      continue
    }

    pendingMigrations.push({
      ...entry,
      hash,
      statements: content
        .split("--> statement-breakpoint")
        .map((statement) => statement.trim())
        .filter(Boolean),
    })
  }

  const deferredErrors = new Map<string, string>()

  while (pendingMigrations.length > 0) {
    let appliedThisPass = 0

    for (let index = 0; index < pendingMigrations.length; ) {
      const migration = pendingMigrations[index]

      try {
        await runMigrationStatements(migration)
        await recordMigration(migration.hash, migration.when)
        console.log(`  ✓ ${migration.tag}`)
        pendingMigrations.splice(index, 1)
        deferredErrors.delete(migration.tag)
        appliedThisPass += 1
      } catch (error: unknown) {
        if (isRetryableDependencyError(error)) {
          const message = getErrorMessage(error)

          if (!deferredErrors.has(migration.tag)) {
            console.warn(`  … deferring ${migration.tag}: ${message}`)
          }

          deferredErrors.set(migration.tag, message)
          index += 1
          continue
        }

        throw error
      }
    }

    if (pendingMigrations.length === 0) {
      break
    }

    if (appliedThisPass === 0) {
      const unresolved = pendingMigrations
        .map(
          (migration) =>
            `- ${migration.tag}: ${deferredErrors.get(migration.tag) ?? "unknown error"}`,
        )
        .join("\n")

      throw new Error(
        `Unable to resolve migration dependencies after retrying pending migrations:\n${unresolved}`,
      )
    }
  }

  console.log("Schema push complete")
} catch (error) {
  console.error("Schema push failed:", error)
  process.exit(1)
} finally {
  await sql.end()
}
