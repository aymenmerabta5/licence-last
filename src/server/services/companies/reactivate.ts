import "server-only"

import { and, eq } from "drizzle-orm"
import { db } from "@/server/db"
import { company } from "@/server/db/schema/companies"
import { createModuleLogger } from "@/server/logging"
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

  const [updated] = await db
    .update(company)
    .set({
      status: "approved",
      approvedAt: new Date(),
      approvedByUserId: reactivatedByUserId,
      rejectionReason: null,
    })
    .where(and(eq(company.id, companyId), eq(company.status, "suspended")))
    .returning({ id: company.id, name: company.name })

  if (!updated) {
    const [existing] = await db
      .select({ id: company.id, status: company.status })
      .from(company)
      .where(eq(company.id, companyId))
      .limit(1)

    if (!existing) {
      throw new ServiceError("COMPANY_NOT_FOUND", "Company not found")
    }

    throw new ServiceError(
      "COMPANY_INVALID_STATUS_TRANSITION",
      "Only suspended companies can be reactivated",
    )
  }

  log.info(
    { companyId: updated.id, event: "company_reactivated" },
    "Company reactivated",
  )
  return { companyId: updated.id, name: updated.name }
}
