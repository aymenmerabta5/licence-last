import "server-only"

import { eq } from "drizzle-orm"

import { createModuleLogger } from "@/server/logging"
import { db } from "@/server/db"
import { company } from "@/server/db/schema/companies"
import { ServiceError } from "@/server/services/errors"

const log = createModuleLogger("services/companies/reactivate")

/**
 * Reactivate a suspended company back to approved.
 * Pure business logic — caller must verify admin role.
 */
export async function reactivateCompany(
  companyId: string,
  reactivatedByUserId: string,
) {
  log.info({ companyId, reactivatedByUserId }, "Reactivating company")

  const [existing] = await db
    .select({ id: company.id, status: company.status })
    .from(company)
    .where(eq(company.id, companyId))
    .limit(1)

  if (!existing) {
    throw new ServiceError("COMPANY_NOT_FOUND", "Company not found")
  }

  if (existing.status !== "suspended") {
    throw new ServiceError(
      "COMPANY_INVALID_STATUS_TRANSITION",
      "Only suspended companies can be reactivated",
    )
  }

  const [updated] = await db
    .update(company)
    .set({
      status: "approved",
      approvedAt: new Date(),
      approvedByUserId: reactivatedByUserId,
      rejectionReason: null,
    })
    .where(eq(company.id, companyId))
    .returning({ id: company.id, name: company.name })

  if (!updated) {
    throw new ServiceError("COMPANY_NOT_FOUND", "Company not found")
  }

  log.info(
    { companyId: updated.id, event: "company_reactivated" },
    "Company reactivated",
  )
  return { companyId: updated.id, name: updated.name }
}
