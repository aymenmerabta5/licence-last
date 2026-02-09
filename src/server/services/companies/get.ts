import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { company, companyMember } from "@/server/db/schema/companies"

/** Get a company by its ID. */
export async function getCompanyById(companyId: string) {
  const [result] = await db
    .select()
    .from(company)
    .where(eq(company.id, companyId))
    .limit(1)

  return result ?? null
}

/** Get the company a user belongs to (via companyMember). */
export async function getCompanyByUserId(userId: string) {
  const [result] = await db
    .select({
      id: company.id,
      name: company.name,
      slug: company.slug,
      status: company.status,
      description: company.description,
      logoUrl: company.logoUrl,
      websiteUrl: company.websiteUrl,
      phone: company.phone,
      contactEmail: company.contactEmail,
      representativeName: company.representativeName,
      wilayaCode: company.wilayaCode,
      address: company.address,
      rejectionReason: company.rejectionReason,
      createdAt: company.createdAt,
    })
    .from(companyMember)
    .innerJoin(company, eq(companyMember.companyId, company.id))
    .where(eq(companyMember.userId, userId))
    .limit(1)

  return result ?? null
}
