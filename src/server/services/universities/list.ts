import "server-only"

import { and, desc, eq, ilike, or } from "drizzle-orm"
import type { UniversityStatus } from "@/lib/schemas/enums"
import { db } from "@/server/db"
import { university } from "@/server/db/schema/universities"

export interface ListUniversitiesInput {
  status?: UniversityStatus
  search?: string
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
  const normalizedSearch = input?.search?.trim()

  const query = db
    .select()
    .from(university)
    .orderBy(desc(university.createdAt))
    .limit(limit + 1)
    .offset(offset)

  const statusFilter = input?.status
    ? eq(university.status, input.status)
    : undefined
  const searchFilter = normalizedSearch
    ? or(
        ilike(university.name, `%${normalizedSearch}%`),
        ilike(university.abbreviation, `%${normalizedSearch}%`),
      )
    : undefined

  const whereClause =
    statusFilter && searchFilter
      ? and(statusFilter, searchFilter)
      : (statusFilter ?? searchFilter)

  const rows = whereClause ? await query.where(whereClause) : await query

  return {
    universities: rows.slice(0, limit),
    hasMore: rows.length > limit,
  }
}
