import "server-only"

import { eq, inArray } from "drizzle-orm"

import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { company, companyMember } from "@/server/db/schema/companies"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"

const log = createModuleLogger("services/companies/delete")

/**
 * Hard-delete a company and reset linked company admins to onboarding state.
 * Pure business logic - caller must enforce authorization.
 */
export async function deleteCompany(companyId: string, deletedByUserId: string) {
  const [existing] = await db
    .select({ id: company.id, name: company.name })
    .from(company)
    .where(eq(company.id, companyId))
    .limit(1)

  if (!existing) {
    throw new ServiceError("COMPANY_NOT_FOUND", "Company not found")
  }

  log.info({ companyId, deletedByUserId }, "Deleting company")

  const affectedUserIds = await db.transaction(async (tx) => {
    const memberships = await tx
      .select({ userId: companyMember.userId })
      .from(companyMember)
      .where(eq(companyMember.companyId, companyId))

    const memberUserIds = memberships.map((membership) => membership.userId)

    if (memberUserIds.length > 0) {
      await tx
        .update(user)
        .set({
          onboardingCompleted: false,
        })
        .where(inArray(user.id, memberUserIds))
    }

    await tx.delete(company).where(eq(company.id, companyId))

    return memberUserIds
  })

  log.info(
    {
      companyId,
      affectedUsers: affectedUserIds.length,
      event: "company_deleted",
    },
    "Company deleted",
  )

  return {
    success: true as const,
    companyId,
    companyName: existing.name,
    affectedUserIds,
  }
}
