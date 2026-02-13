import "server-only"

import { eq } from "drizzle-orm"

import { createModuleLogger } from "@/server/logging"
import { db } from "@/server/db"

const log = createModuleLogger("services/companies/reject")
import { company } from "@/server/db/schema/companies"

/**
 * Reject a company application with a reason.
 * Pure business logic — caller must verify admin role.
 */
export async function rejectCompany(companyId: string, reason: string) {
  log.info({ companyId }, "Rejecting company")
  const [updated] = await db
    .update(company)
    .set({
      status: "rejected",
      rejectionReason: reason,
    })
    .where(eq(company.id, companyId))
    .returning({ id: company.id, name: company.name })

  if (!updated) {
    throw new Error("Company not found")
  }

  log.info({ companyId: updated.id, event: "company_rejected" }, "Company rejected")
  return { companyId: updated.id, name: updated.name }
}
