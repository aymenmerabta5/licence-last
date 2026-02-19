import "server-only"

import { eq } from "drizzle-orm"
import { db } from "@/server/db"
import { createModuleLogger } from "@/server/logging"

const log = createModuleLogger("services/companies/approve")

import { company } from "@/server/db/schema/companies"

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
    .where(eq(company.id, companyId))
    .returning({ id: company.id, name: company.name })

  if (!updated) {
    throw new Error("Company not found")
  }

  log.info(
    { companyId: updated.id, event: "company_approved" },
    "Company approved",
  )
  return { companyId: updated.id, name: updated.name }
}
