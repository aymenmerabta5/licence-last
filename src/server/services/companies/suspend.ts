import "server-only"

import { and, eq } from "drizzle-orm"
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

  const [updated] = await db
    .update(company)
    .set({
      status: "suspended",
    })
    .where(and(eq(company.id, companyId), eq(company.status, "approved")))
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
      "Only approved companies can be suspended",
    )
  }

  log.info(
    { companyId: updated.id, event: "company_suspended" },
    "Company suspended",
  )
  return { companyId: updated.id, name: updated.name }
}
