import "server-only"

import { eq } from "drizzle-orm"
import { db } from "@/server/db"
import { company } from "@/server/db/schema/companies"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"

const log = createModuleLogger("services/companies/suspend")

/**
 * Suspend an approved company.
 * Pure business logic — caller must verify admin role.
 */
export async function suspendCompany(
  companyId: string,
  suspendedByUserId: string,
) {
  log.info({ companyId, suspendedByUserId }, "Suspending company")

  const [existing] = await db
    .select({ id: company.id, status: company.status })
    .from(company)
    .where(eq(company.id, companyId))
    .limit(1)

  if (!existing) {
    throw new ServiceError("COMPANY_NOT_FOUND", "Company not found")
  }

  if (existing.status !== "approved") {
    throw new ServiceError(
      "COMPANY_INVALID_STATUS_TRANSITION",
      "Only approved companies can be suspended",
    )
  }

  const [updated] = await db
    .update(company)
    .set({
      status: "suspended",
    })
    .where(eq(company.id, companyId))
    .returning({ id: company.id, name: company.name })

  if (!updated) {
    throw new ServiceError("COMPANY_NOT_FOUND", "Company not found")
  }

  log.info(
    { companyId: updated.id, event: "company_suspended" },
    "Company suspended",
  )
  return { companyId: updated.id, name: updated.name }
}
