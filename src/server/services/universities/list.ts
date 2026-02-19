import "server-only"

import { desc, eq } from "drizzle-orm"
import type { UniversityStatus } from "@/lib/schemas/enums"
import { db } from "@/server/db"
import { university } from "@/server/db/schema/universities"

export interface ListUniversitiesInput {
  status?: UniversityStatus
  limit?: number
  offset?: number
}

export interface ListUniversitiesResult {
  universities: (typeof university.$inferSelect)[]
  hasMore: boolean
}

export async function listUniversities(
  input?: ListUniversitiesInput,
): Promise<ListUniversitiesResult> {
  const limit = Math.min(input?.limit ?? 50, 200)
  const offset = input?.offset ?? 0

  const query = db
    .select()
    .from(university)
    .orderBy(desc(university.createdAt))
    .limit(limit + 1)
    .offset(offset)

  const rows = input?.status
    ? await query.where(eq(university.status, input.status))
    : await query

  return {
    universities: rows.slice(0, limit),
    hasMore: rows.length > limit,
  }
}
