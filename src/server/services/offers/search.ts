"use cache"

import "server-only"

import {
  eq,
  desc,
  and,
  or,
  ilike,
  inArray,
  lt,
  sql,
  isNull,
  gt,
} from "drizzle-orm"
import { cacheTag, cacheLife } from "next/cache"

import { db } from "@/server/db"
import {
  internshipOffer,
  internshipOfferSkill,
} from "@/server/db/schema/internships"
import { company } from "@/server/db/schema/companies"
import { skillTag } from "@/server/db/schema/skills"
import { CACHE_TAGS } from "@/lib/cache"

interface SearchParams {
  keyword?: string
  wilayaCode?: number
  internshipTypes?: ("pfe" | "immersion" | "summer" | "practical")[]
  workModes?: ("on_site" | "hybrid" | "remote")[]
  skillTagIds?: string[]
  cursor?: { createdAt: string; id: string }
  limit: number
}

/**
 * Search published internship offers with filtering.
 * Cached for 2 minutes with tag-based invalidation.
 */
export async function searchOffers(params: SearchParams) {
  cacheLife("minutes")
  cacheTag(CACHE_TAGS.OFFER_SEARCH)
  cacheTag(CACHE_TAGS.OFFERS_PUBLIC)

  if (params.wilayaCode) {
    cacheTag(`offers-wilaya-${params.wilayaCode}`)
  }
  if (params.internshipTypes?.length) {
    for (const type of params.internshipTypes) {
      cacheTag(`offers-type-${type}`)
    }
  }
  if (params.skillTagIds?.length) {
    for (const skillId of params.skillTagIds) {
      cacheTag(`offers-skill-${skillId}`)
    }
  }
  const {
    keyword,
    wilayaCode,
    internshipTypes,
    workModes,
    skillTagIds,
    cursor,
    limit,
  } = params

  // Build WHERE conditions
  const conditions = [
    eq(internshipOffer.status, "published"),
    or(
      isNull(internshipOffer.applicationDeadlineAt),
      gt(internshipOffer.applicationDeadlineAt, new Date()),
    ),
  ]

  if (wilayaCode) {
    conditions.push(eq(internshipOffer.wilayaCode, wilayaCode))
  }

  if (internshipTypes && internshipTypes.length > 0) {
    conditions.push(inArray(internshipOffer.internshipType, internshipTypes))
  }

  if (workModes && workModes.length > 0) {
    conditions.push(inArray(internshipOffer.workMode, workModes))
  }

  if (keyword) {
    // Escape LIKE special characters to prevent wildcard injection
    const escapedKeyword = keyword.replace(/[%_\\]/g, "\\$&")
    const pattern = `%${escapedKeyword}%`
    const keywordCondition = or(
      ilike(internshipOffer.title, pattern),
      ilike(internshipOffer.description, pattern),
    )
    if (keywordCondition) {
      conditions.push(keywordCondition)
    }
  }

  // Skill filter: offers that require ANY of the selected skills
  if (skillTagIds && skillTagIds.length > 0) {
    conditions.push(
      sql`${internshipOffer.id} IN (
        SELECT ${internshipOfferSkill.offerId}
        FROM ${internshipOfferSkill}
        WHERE ${inArray(internshipOfferSkill.skillTagId, skillTagIds)}
      )`,
    )
  }

  // Cursor pagination: (createdAt, id) < (cursorCreatedAt, cursorId)
  if (cursor) {
    const cursorDate = new Date(cursor.createdAt)
    const cursorCondition = or(
      lt(internshipOffer.createdAt, cursorDate),
      and(
        eq(internshipOffer.createdAt, cursorDate),
        lt(internshipOffer.id, cursor.id),
      ),
    )
    if (cursorCondition) {
      conditions.push(cursorCondition)
    }
  }

  // Fetch limit + 1 to detect hasMore
  const rows = await db
    .select({
      id: internshipOffer.id,
      companyId: internshipOffer.companyId,
      title: internshipOffer.title,
      description: internshipOffer.description,
      internshipType: internshipOffer.internshipType,
      workMode: internshipOffer.workMode,
      wilayaCode: internshipOffer.wilayaCode,
      durationWeeks: internshipOffer.durationWeeks,
      maxPositions: internshipOffer.maxPositions,
      status: internshipOffer.status,
      applicationDeadlineAt: internshipOffer.applicationDeadlineAt,
      expectedStartDate: internshipOffer.expectedStartDate,
      expectedEndDate: internshipOffer.expectedEndDate,
      closesAt: internshipOffer.closesAt,
      createdAt: internshipOffer.createdAt,
      companyName: company.name,
      companySlug: company.slug,
      companyLogoUrl: company.logoUrl,
      companyWilayaCode: company.wilayaCode,
    })
    .from(internshipOffer)
    .innerJoin(company, eq(internshipOffer.companyId, company.id))
    .where(and(...conditions))
    .orderBy(desc(internshipOffer.createdAt), desc(internshipOffer.id))
    .limit(limit + 1)

  const hasMore = rows.length > limit
  const offers = hasMore ? rows.slice(0, limit) : rows

  // Batch-fetch skills for all results
  const offerIds = offers.map((o) => o.id)
  let skillsByOffer = new Map<
    string,
    { id: string; name: string; slug: string; category: string | null }[]
  >()

  if (offerIds.length > 0) {
    const offerSkills = await db
      .select({
        offerId: internshipOfferSkill.offerId,
        skillId: skillTag.id,
        skillName: skillTag.name,
        skillSlug: skillTag.slug,
        skillCategory: skillTag.category,
      })
      .from(internshipOfferSkill)
      .innerJoin(skillTag, eq(internshipOfferSkill.skillTagId, skillTag.id))
      .where(inArray(internshipOfferSkill.offerId, offerIds))

    skillsByOffer = new Map()
    for (const row of offerSkills) {
      const existing = skillsByOffer.get(row.offerId) ?? []
      existing.push({
        id: row.skillId,
        name: row.skillName,
        slug: row.skillSlug,
        category: row.skillCategory,
      })
      skillsByOffer.set(row.offerId, existing)
    }
  }

  const lastOffer = offers[offers.length - 1]
  const nextCursor = hasMore && lastOffer
    ? { createdAt: lastOffer.createdAt.toISOString(), id: lastOffer.id }
    : undefined

  return {
    offers: offers.map((offer) => ({
      ...offer,
      skills: skillsByOffer.get(offer.id) ?? [],
    })),
    nextCursor,
    hasMore,
  }
}
