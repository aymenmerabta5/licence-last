"use cache"

import "server-only"

import { and, desc, eq, gt, ilike, isNull, lt, or, sql } from "drizzle-orm"
import { cacheLife, cacheTag } from "next/cache"
import { CACHE_TAGS } from "@/lib/cache"
import { db } from "@/server/db"
import { company } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"

interface ListPublicDirectoryInput {
  keyword?: string
  wilayaCode?: number
  cursor?: { createdAt: string; id: string }
  limit: number
}

/**
 * Student-facing company directory:
 * approved companies that have at least one active published offer.
 */
export async function listPublicDirectoryCompanies(
  params: ListPublicDirectoryInput,
) {
  cacheLife("minutes")
  cacheTag(CACHE_TAGS.COMPANIES_DIRECTORY)

  if (params.wilayaCode) {
    cacheTag(`companies-directory-wilaya-${params.wilayaCode}`)
  }

  const activeOfferCounts = db
    .select({
      companyId: internshipOffer.companyId,
      openOffersCount: sql<number>`count(*)::int`.as("openOffersCount"),
    })
    .from(internshipOffer)
    .where(
      and(
        eq(internshipOffer.status, "published"),
        or(
          isNull(internshipOffer.applicationDeadlineAt),
          gt(internshipOffer.applicationDeadlineAt, new Date()),
        ),
      ),
    )
    .groupBy(internshipOffer.companyId)
    .as("active_offer_counts")

  const { keyword, wilayaCode, cursor, limit } = params
  const conditions = [eq(company.status, "approved")]

  if (wilayaCode) {
    conditions.push(eq(company.wilayaCode, wilayaCode))
  }

  if (keyword) {
    // Escape LIKE wildcards to prevent wildcard injection.
    const escapedKeyword = keyword.replace(/[%_\\]/g, "\\$&")
    const pattern = `%${escapedKeyword}%`
    const keywordCondition = or(
      ilike(company.name, pattern),
      ilike(company.slug, pattern),
      ilike(company.description, pattern),
    )

    if (keywordCondition) {
      conditions.push(keywordCondition)
    }
  }

  if (cursor) {
    const cursorDate = new Date(cursor.createdAt)
    const cursorCondition = or(
      lt(company.createdAt, cursorDate),
      and(eq(company.createdAt, cursorDate), lt(company.id, cursor.id)),
    )

    if (cursorCondition) {
      conditions.push(cursorCondition)
    }
  }

  const rows = await db
    .select({
      id: company.id,
      name: company.name,
      slug: company.slug,
      description: company.description,
      logoUrl: company.logoUrl,
      websiteUrl: company.websiteUrl,
      wilayaCode: company.wilayaCode,
      createdAt: company.createdAt,
      openOffersCount: activeOfferCounts.openOffersCount,
    })
    .from(company)
    .innerJoin(activeOfferCounts, eq(company.id, activeOfferCounts.companyId))
    .where(and(...conditions))
    .orderBy(desc(company.createdAt), desc(company.id))
    .limit(limit + 1)

  const hasMore = rows.length > limit
  const companies = hasMore ? rows.slice(0, limit) : rows

  const lastCompany = companies[companies.length - 1]
  const nextCursor =
    hasMore && lastCompany
      ? {
          createdAt: lastCompany.createdAt.toISOString(),
          id: lastCompany.id,
        }
      : undefined

  return {
    companies: companies.map((companyRow) => ({
      ...companyRow,
      openOffersCount: Number(companyRow.openOffersCount),
    })),
    hasMore,
    nextCursor,
  }
}
