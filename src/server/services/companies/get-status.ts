import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { company, companyMember } from "@/server/db/schema/companies"
import { ServiceError } from "@/server/services/errors"

/**
 * Get company status for a user - UNCACHED.
 * Used by auth guards and middleware where stale data can leak access.
 */
export async function getCompanyStatusByUserId(userId: string) {
  const rows = await db
    .select({
      id: company.id,
      status: company.status,
      rejectionReason: company.rejectionReason,
    })
    .from(companyMember)
    .innerJoin(company, eq(companyMember.companyId, company.id))
    .where(eq(companyMember.userId, userId))
    .limit(2)

  if (rows.length > 1) {
    throw new ServiceError(
      "COMPANY_MEMBERSHIP_CONFLICT",
      "User belongs to multiple companies",
    )
  }

  return rows[0] ?? null
}
