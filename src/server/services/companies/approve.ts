import "server-only"

import { and, eq } from "drizzle-orm"
import { db } from "@/server/db"
import { company } from "@/server/db/schema/companies"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"

const log = createModuleLogger("services/companies/approve")

/**
 * Approve a company application.
 * Pure business logic — caller must verify admin role.
 */
export async function approveCompany(
  companyId: string,
  approvedByUserId: string,
) {
  log.info({ companyId, approvedByUserId }, "Approving company")

  const [updated] = await db
    .update(company)
    .set({
      status: "approved",
      approvedAt: new Date(),
      approvedByUserId,
      rejectionReason: null,
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
      "Only pending companies can be approved",
    )
  }

  log.info(
    { companyId: updated.id, event: "company_approved" },
    "Company approved",
  )
  return { companyId: updated.id, name: updated.name }
}
