import "server-only"

import { desc, eq } from "drizzle-orm"
import type { CompanyStatus } from "@/lib/schemas/enums"
import { db } from "@/server/db"
import { company } from "@/server/db/schema/companies"

export interface ListCompaniesInput {
  status?: CompanyStatus
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

  const query = db
    .select()
    .from(company)
    .orderBy(desc(company.createdAt))
    .limit(limit + 1)
    .offset(offset)

  const rows = input?.status
    ? await query.where(eq(company.status, input.status))
    : await query

  return {
    companies: rows.slice(0, limit),
    hasMore: rows.length > limit,
  }
}
