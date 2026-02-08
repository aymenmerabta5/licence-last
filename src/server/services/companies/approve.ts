import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { company } from "@/server/db/schema/companies"

/**
 * Approve a company application.
 * Pure business logic — caller must verify admin role.
 */
export async function approveCompany(
  companyId: string,
  approvedByUserId: string,
) {
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

  return { companyId: updated.id, name: updated.name }
}
