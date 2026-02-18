"use cache"

import "server-only"

import { and, eq } from "drizzle-orm"
import { cacheLife, cacheTag } from "next/cache"

import { CACHE_TAGS } from "@/lib/cache"
import { db } from "@/server/db"
import { company } from "@/server/db/schema/companies"

/**
 * Returns public-safe company data when the company is approved.
 */
export async function getPublicCompanyBySlug(slug: string) {
  cacheLife({ expire: 60 })
  cacheTag(`company-slug-${slug}`)

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

  if (row) {
    cacheTag(CACHE_TAGS.COMPANY_PROFILE(row.id))
  }

  return row ?? null
}
