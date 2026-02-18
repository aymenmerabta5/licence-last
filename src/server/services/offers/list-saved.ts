import "server-only"

import { and, desc, eq, inArray, lt, or } from "drizzle-orm"

import { db } from "@/server/db"
import {
  internshipOffer,
  internshipOfferSkill,
  savedOffer,
} from "@/server/db/schema/internships"
import { company } from "@/server/db/schema/companies"
import { skillTag } from "@/server/db/schema/skills"

export interface ListSavedOffersInput {
  cursor?: {
    savedAt: string
    offerId: string
  }
  limit?: number
}

export interface ListSavedOffersResult {
  offers: Array<{
    offerId: string
    savedAt: Date
    title: string
    description: string
    internshipType: "pfe" | "immersion" | "summer" | "practical"
    workMode: "on_site" | "hybrid" | "remote" | null
    wilayaCode: number | null
    durationWeeks: number | null
    maxPositions: number
    status: "draft" | "published" | "closed"
    applicationDeadlineAt: Date | null
    expectedStartDate: Date | null
    expectedEndDate: Date | null
    closesAt: Date | null
    createdAt: Date
    companyId: string
    companyName: string
    companySlug: string
    companyLogoUrl: string | null
    companyWilayaCode: number | null
    skills: Array<{
      id: string
      name: string
      slug: string
      category: string | null
    }>
  }>
  nextCursor:
    | {
        savedAt: string
        offerId: string
      }
    | undefined
  hasMore: boolean
}

export async function listSavedOffers(
  userId: string,
  input: ListSavedOffersInput = {},
): Promise<ListSavedOffersResult> {
  const { cursor, limit = 12 } = input

  const conditions = [eq(savedOffer.userId, userId), eq(company.status, "approved")]
  if (cursor) {
    const cursorDate = new Date(cursor.savedAt)
    conditions.push(
      or(
        lt(savedOffer.createdAt, cursorDate),
        and(
          eq(savedOffer.createdAt, cursorDate),
          lt(savedOffer.offerId, cursor.offerId),
        ),
      )!,
    )
  }

  const rows = await db
    .select({
      offerId: savedOffer.offerId,
      savedAt: savedOffer.createdAt,
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
      companyId: internshipOffer.companyId,
      companyName: company.name,
      companySlug: company.slug,
      companyLogoUrl: company.logoUrl,
      companyWilayaCode: company.wilayaCode,
    })
    .from(savedOffer)
    .innerJoin(internshipOffer, eq(savedOffer.offerId, internshipOffer.id))
    .innerJoin(company, eq(internshipOffer.companyId, company.id))
    .where(and(...conditions))
    .orderBy(desc(savedOffer.createdAt), desc(savedOffer.offerId))
    .limit(limit + 1)

  const hasMore = rows.length > limit
  const offers = hasMore ? rows.slice(0, limit) : rows

  const offerIds = offers.map((offer) => offer.offerId)
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

  const last = offers[offers.length - 1]
  const nextCursor =
    hasMore && last
      ? {
          savedAt: last.savedAt.toISOString(),
          offerId: last.offerId,
        }
      : undefined

  return {
    offers: offers.map((offer) => ({
      ...offer,
      skills: skillsByOffer.get(offer.offerId) ?? [],
    })),
    nextCursor,
    hasMore,
  }
}
