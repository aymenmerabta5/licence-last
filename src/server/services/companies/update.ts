import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { company } from "@/server/db/schema/companies"

/**
 * Update a company's profile fields.
 * Pure business logic — no auth checks here.
 */
export async function updateCompany(
  companyId: string,
  data: {
    description?: string
    logoUrl?: string
    websiteUrl?: string
    phone?: string
    contactEmail?: string
    representativeName?: string
    wilayaCode?: number
    address?: string
  },
) {
  const [result] = await db
    .update(company)
    .set({
      description: data.description ?? undefined,
      logoUrl: data.logoUrl ?? undefined,
      websiteUrl: data.websiteUrl ?? undefined,
      phone: data.phone ?? undefined,
      contactEmail: data.contactEmail ?? undefined,
      representativeName: data.representativeName ?? undefined,
      wilayaCode: data.wilayaCode ?? undefined,
      address: data.address ?? undefined,
    })
    .where(eq(company.id, companyId))
    .returning({ companyId: company.id })

  if (!result) {
    throw new Error("Company not found")
  }

  return { companyId: result.companyId }
}
