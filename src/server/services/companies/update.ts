import "server-only"

import { eq } from "drizzle-orm"
import { db } from "@/server/db"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"

const log = createModuleLogger("services/companies/update")

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
  log.info({ companyId }, "Updating company profile")

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
    throw new ServiceError("COMPANY_NOT_FOUND", "Company not found")
  }

  log.info({ companyId, event: "company_updated" }, "Company profile updated")
  return { companyId: result.companyId }
}
