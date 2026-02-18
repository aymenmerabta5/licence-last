import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@/server/db"
import { company } from "@/server/db/schema/companies"

/**
 * Returns public-safe company data when the company is approved.
 */
export async function getPublicCompanyBySlug(slug: string) {
  const [row] = await db
    .select({
      id: company.id,
      name: company.name,
      slug: company.slug,
      description: company.description,
      logoUrl: company.logoUrl,
      websiteUrl: company.websiteUrl,
      wilayaCode: company.wilayaCode,
      address: company.address,
      createdAt: company.createdAt,
    })
    .from(company)
    .where(and(eq(company.slug, slug), eq(company.status, "approved")))
    .limit(1)

  return row ?? null
}
