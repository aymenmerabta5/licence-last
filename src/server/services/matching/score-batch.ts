import "server-only"

import { eq, inArray } from "drizzle-orm"

import { db } from "@/server/db"
import {
  internshipOffer,
  internshipOfferSkill,
} from "@/server/db/schema/internships"
import {
  internshipOfferLanguageRequirement,
  studentLanguage,
} from "@/server/db/schema/languages"
import { skillTag } from "@/server/db/schema/skills"
import { studentProfile, studentSkill } from "@/server/db/schema/students"

import {
  computeExplainableMatchScore,
  type MatchScoreResult,
} from "@/server/services/matching/score-core"

export async function getExplainableMatchScoresBatch(
  studentUserId: string,
  offerIds: string[],
): Promise<Map<string, MatchScoreResult>> {
  if (offerIds.length === 0) {
    return new Map()
  }

  const [offers, profile, offerSkills, studentSkills, languageReqs, languages] =
    await Promise.all([
      db
        .select({
          id: internshipOffer.id,
          wilayaCode: internshipOffer.wilayaCode,
          workMode: internshipOffer.workMode,
        })
        .from(internshipOffer)
        .where(inArray(internshipOffer.id, offerIds)),
      db
        .select()
        .from(studentProfile)
        .where(eq(studentProfile.userId, studentUserId))
        .limit(1)
        .then((rows) => rows[0] ?? null),
      db
        .select({
          offerId: internshipOfferSkill.offerId,
          id: skillTag.id,
          name: skillTag.name,
          slug: skillTag.slug,
          category: skillTag.category,
        })
        .from(internshipOfferSkill)
        .innerJoin(skillTag, eq(internshipOfferSkill.skillTagId, skillTag.id))
        .where(inArray(internshipOfferSkill.offerId, offerIds)),
      db
        .select({
          id: skillTag.id,
          name: skillTag.name,
          slug: skillTag.slug,
          category: skillTag.category,
        })
        .from(studentSkill)
        .innerJoin(skillTag, eq(studentSkill.skillTagId, skillTag.id))
        .where(eq(studentSkill.userId, studentUserId)),
      db
        .select({
          offerId: internshipOfferLanguageRequirement.offerId,
          languageCode: internshipOfferLanguageRequirement.languageCode,
          minimumProficiency:
            internshipOfferLanguageRequirement.minimumProficiency,
          isRequired: internshipOfferLanguageRequirement.isRequired,
          weight: internshipOfferLanguageRequirement.weight,
        })
        .from(internshipOfferLanguageRequirement)
        .where(inArray(internshipOfferLanguageRequirement.offerId, offerIds)),
      db
        .select({
          languageCode: studentLanguage.languageCode,
          proficiency: studentLanguage.proficiency,
        })
        .from(studentLanguage)
        .where(eq(studentLanguage.userId, studentUserId)),
    ])

  const offerSkillsByOffer = new Map<
    string,
    Array<{ id: string; name: string; slug: string; category: string | null }>
  >()
  for (const skill of offerSkills) {
    const existing = offerSkillsByOffer.get(skill.offerId) ?? []
    existing.push({
      id: skill.id,
      name: skill.name,
      slug: skill.slug,
      category: skill.category,
    })
    offerSkillsByOffer.set(skill.offerId, existing)
  }

  const languageReqsByOffer = new Map<
    string,
    Array<{
      languageCode: string
      minimumProficiency: string
      isRequired: boolean
      weight: number
    }>
  >()
  for (const req of languageReqs) {
    const existing = languageReqsByOffer.get(req.offerId) ?? []
    existing.push({
      languageCode: req.languageCode,
      minimumProficiency: req.minimumProficiency,
      isRequired: req.isRequired,
      weight: req.weight,
    })
    languageReqsByOffer.set(req.offerId, existing)
  }

  const results = new Map<string, MatchScoreResult>()

  for (const offer of offers) {
    const result = computeExplainableMatchScore({
      offer,
      profile,
      offerSkills: offerSkillsByOffer.get(offer.id) ?? [],
      studentSkills,
      languageReqs: languageReqsByOffer.get(offer.id) ?? [],
      languages,
    })
    results.set(offer.id, result)
  }

  return results
}
