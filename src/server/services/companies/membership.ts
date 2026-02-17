import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { companyMember } from "@/server/db/schema/companies"
import { ServiceError } from "@/server/services/errors"

export async function getCompanyMembership(userId: string) {
  const memberships = await db
    .select()
    .from(companyMember)
    .where(eq(companyMember.userId, userId))
    .limit(2)

  if (memberships.length > 1) {
    throw new ServiceError(
      "COMPANY_MEMBERSHIP_CONFLICT",
      "User belongs to multiple companies",
    )
  }

  const membership = memberships[0]

  return membership ?? null
}
