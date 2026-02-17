"use cache"

import "server-only"

import { eq } from "drizzle-orm"
import { cacheTag, cacheLife } from "next/cache"

import { db } from "@/server/db"
import { company, companyMember } from "@/server/db/schema/companies"
import { CACHE_TAGS } from "@/lib/cache"
import { ServiceError } from "@/server/services/errors"

/** Get a company by its ID. Cached for 15 minutes. */
export async function getCompanyById(companyId: string) {
  cacheLife("minutes")
  cacheTag(CACHE_TAGS.COMPANY_PROFILE(companyId))
  const [result] = await db
    .select()
    .from(company)
    .where(eq(company.id, companyId))
    .limit(1)

  return result ?? null
}

/**
 * Get the company a user belongs to (via companyMember).
 * Cached for 15 minutes per user.
 */
export async function getCompanyByUserId(userId: string) {
  cacheLife("minutes")
  cacheTag(CACHE_TAGS.COMPANY_PROFILE(`user-${userId}`))
  const rows = await db
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
    .limit(2)

  if (rows.length > 1) {
    throw new ServiceError(
      "COMPANY_MEMBERSHIP_CONFLICT",
      "User belongs to multiple companies",
    )
  }

  const result = rows[0]

  return result ?? null
}
