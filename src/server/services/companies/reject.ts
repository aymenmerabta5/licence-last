import "server-only"

import { and, eq } from "drizzle-orm"
import { db } from "@/server/db"
import { company } from "@/server/db/schema/companies"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"

const log = createModuleLogger("services/companies/reject")

/**
 * Reject a company application with a reason.
 * Pure business logic — caller must verify admin role.
 */
export async function rejectCompany(
  companyId: string,
  reason: string,
  rejectedByUserId: string,
) {
  log.info({ companyId, rejectedByUserId }, "Rejecting company")
  const [updated] = await db
    .update(company)
    .set({
      status: "rejected",
      rejectionReason: reason,
    })
    .where(and(eq(company.id, companyId), eq(company.status, "pending")))
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
      "Only pending companies can be rejected",
    )
  }

  log.info(
    { companyId: updated.id, event: "company_rejected" },
    "Company rejected",
  )
  return { companyId: updated.id, name: updated.name }
}
