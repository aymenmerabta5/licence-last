import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { company } from "@/server/db/schema/companies"

/**
 * Reject a company application with a reason.
 * Pure business logic — caller must verify admin role.
 */
export async function rejectCompany(companyId: string, reason: string) {
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

  return { companyId: updated.id, name: updated.name }
}
