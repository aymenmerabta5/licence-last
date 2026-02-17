import "server-only"

import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"

import { env } from "@/env"
import * as schema from "@/server/db/schema"

const globalForPostgres = globalThis as unknown as {
  postgresClient?: ReturnType<typeof postgres>
}

const client =
  globalForPostgres.postgresClient ??
  postgres(env.DATABASE_URL, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 30,
    max_lifetime: 60 * 5,
    prepare: false,
  })

if (process.env.NODE_ENV !== "production") {
  globalForPostgres.postgresClient = client
}

export const db = drizzle(client, { schema })

/**
 * Lightweight readiness probe for the primary database.
 */
export async function pingDatabase(): Promise<boolean> {
  try {
    await client`select 1`
    return true
  } catch {
    return false
  }
}
