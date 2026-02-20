import "server-only"

import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm"
import type { CompanyStatus } from "@/lib/schemas/enums"
import { db } from "@/server/db"
import { company } from "@/server/db/schema/companies"

export interface ListCompaniesInput {
  status?: CompanyStatus
  search?: string
  limit?: number
  offset?: number
}

export interface ListCompaniesResult {
  companies: (typeof company.$inferSelect)[]
  hasMore: boolean
}

export async function listCompanies(
  input?: ListCompaniesInput,
): Promise<ListCompaniesResult> {
  const limit = Math.min(input?.limit ?? 50, 200)
  const offset = input?.offset ?? 0
  const search = input?.search?.trim()
  const conditions: SQL[] = []

  if (input?.status) {
    conditions.push(eq(company.status, input.status))
  }

  if (search) {
    // Escape LIKE wildcards to prevent query wildcard injection.
    const escapedSearch = search.replace(/[%_\\]/g, "\\$&")
    const pattern = `%${escapedSearch}%`
    const searchCondition = or(
      ilike(company.name, pattern),
      ilike(company.slug, pattern),
    )
    if (searchCondition) {
      conditions.push(searchCondition)
    }
  }

  const query = db
    .select()
    .from(company)
    .orderBy(desc(company.createdAt))
    .limit(limit + 1)
    .offset(offset)

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined
  const rows = whereClause ? await query.where(whereClause) : await query

  return {
    companies: rows.slice(0, limit),
    hasMore: rows.length > limit,
  }
}
