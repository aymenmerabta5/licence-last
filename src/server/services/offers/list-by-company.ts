import "server-only"

import { eq, desc, inArray } from "drizzle-orm"

import { db } from "@/server/db"
import { internshipOffer, internshipOfferSkill } from "@/server/db/schema/internships"
import { skillTag } from "@/server/db/schema/skills"

/**
 * List all offers for a company, ordered by creation date (newest first).
 * Batch-fetches skills for all offers to avoid N+1.
 */
export async function listOffersByCompany(companyId: string) {
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

  // Group skills by offerId
  const skillsByOffer = new Map<string, typeof offerSkills>()
  for (const row of offerSkills) {
    const existing = skillsByOffer.get(row.offerId) ?? []
    existing.push(row)
    skillsByOffer.set(row.offerId, existing)
  }

  return offers.map((offer) => ({
    ...offer,
    skills: (skillsByOffer.get(offer.id) ?? []).map((s) => ({
      id: s.skillId,
      name: s.skillName,
      slug: s.skillSlug,
      category: s.skillCategory,
    })),
  }))
}
