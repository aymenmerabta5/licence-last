"use cache"

import "server-only"

import { eq, desc, inArray, count } from "drizzle-orm"
import { cacheTag, cacheLife } from "next/cache"

import { db } from "@/server/db"
import { internshipOffer, internshipOfferSkill } from "@/server/db/schema/internships"
import { skillTag } from "@/server/db/schema/skills"
import { application } from "@/server/db/schema/applications"
import { CACHE_TAGS } from "@/lib/cache"

interface OfferWithSkills {
  id: string
  companyId: string
  title: string
  description: string
  internshipType: "pfe" | "immersion" | "summer" | "practical"
  workMode: "on_site" | "hybrid" | "remote" | null
  wilayaCode: number | null
  durationWeeks: number | null
  maxPositions: number
  status: "draft" | "published" | "closed"
  publishedAt: Date | null
  closesAt: Date | null
  createdAt: Date
  updatedAt: Date
  skills: Array<{
    id: string
    name: string
    slug: string
    category: string | null
  }>
  candidatesCount: number
}

/**
 * List all offers for a company with skills and candidate counts.
 * Cached for 5 minutes per company.
 */
export async function listOffersByCompany(companyId: string): Promise<OfferWithSkills[]> {
  cacheLife("minutes")
  cacheTag(CACHE_TAGS.COMPANY_OFFERS(companyId))
  const offers = await db
    .select()
    .from(internshipOffer)
    .where(eq(internshipOffer.companyId, companyId))
    .orderBy(desc(internshipOffer.createdAt))

  if (offers.length === 0) return []

  const offerIds = offers.map((o) => o.id)

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

  const applicationCounts = await db
    .select({
      offerId: application.offerId,
      count: count(),
    })
    .from(application)
    .where(inArray(application.offerId, offerIds))
    .groupBy(application.offerId)

  const skillsByOffer = new Map<string, typeof offerSkills>()
  for (const row of offerSkills) {
    const existing = skillsByOffer.get(row.offerId) ?? []
    existing.push(row)
    skillsByOffer.set(row.offerId, existing)
  }

  const countsByOffer = new Map<string, number>()
  for (const row of applicationCounts) {
    countsByOffer.set(row.offerId, row.count)
  }

  return offers.map((offer) => ({
    ...offer,
    skills: (skillsByOffer.get(offer.id) ?? []).map((s) => ({
      id: s.skillId,
      name: s.skillName,
      slug: s.skillSlug,
      category: s.skillCategory,
    })),
    candidatesCount: countsByOffer.get(offer.id) ?? 0,
  }))
}
