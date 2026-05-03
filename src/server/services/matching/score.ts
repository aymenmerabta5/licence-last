import "server-only"

import { eq } from "drizzle-orm"

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

import { ServiceError } from "@/server/services/errors"
import {
  computeExplainableMatchScore,
  type MatchScoreResult,
} from "@/server/services/matching/score-core"

export type {
  MatchReason,
  MatchScoreResult,
} from "@/server/services/matching/score-core"

export async function getExplainableMatchScore(
  studentUserId: string,
  offerId: string,
): Promise<MatchScoreResult> {
  const [offer, profile, offerSkills, studentSkills, languageReqs, languages] =
    await Promise.all([
      db
        .select({
          id: internshipOffer.id,
          wilayaCode: internshipOffer.wilayaCode,
          workMode: internshipOffer.workMode,
        })
        .from(internshipOffer)
        .where(eq(internshipOffer.id, offerId))
        .limit(1)
        .then((rows) => rows[0]),
      db
        .select()
        .from(studentProfile)
        .where(eq(studentProfile.userId, studentUserId))
        .limit(1)
        .then((rows) => rows[0] ?? null),
      db
        .select({
          id: skillTag.id,
          name: skillTag.name,
          slug: skillTag.slug,
          category: skillTag.category,
        })
        .from(internshipOfferSkill)
        .innerJoin(skillTag, eq(internshipOfferSkill.skillTagId, skillTag.id))
        .where(eq(internshipOfferSkill.offerId, offerId)),
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
          languageCode: internshipOfferLanguageRequirement.languageCode,
          minimumProficiency:
            internshipOfferLanguageRequirement.minimumProficiency,
          isRequired: internshipOfferLanguageRequirement.isRequired,
          weight: internshipOfferLanguageRequirement.weight,
        })
        .from(internshipOfferLanguageRequirement)
        .where(eq(internshipOfferLanguageRequirement.offerId, offerId)),
      db
        .select({
          languageCode: studentLanguage.languageCode,
          proficiency: studentLanguage.proficiency,
        })
        .from(studentLanguage)
        .where(eq(studentLanguage.userId, studentUserId)),
    ])

  if (!offer) {
    throw new ServiceError("OFFER_NOT_FOUND", "Offer not found")
  }

  return computeExplainableMatchScore({
    offer,
    profile,
    offerSkills,
    studentSkills,
    languageReqs,
    languages,
  })
}

export function canAccessMatchScore(
  viewer: { id: string; role: string },
  params: {
    studentUserId: string
    offerCompanyId: string
    isOfferVisibleToStudent: boolean
    viewerCompanyId?: string
    hasApplicationRelationship?: boolean
  },
) {
  if (viewer.role === "super_admin") return true
  if (viewer.role === "student") {
    return viewer.id === params.studentUserId && params.isOfferVisibleToStudent
  }
  if (viewer.role === "company_admin") {
    return (
      params.viewerCompanyId === params.offerCompanyId &&
      params.hasApplicationRelationship === true
    )
  }
  return false
}

export async function getOfferAccessContext(offerId: string): Promise<{
  companyId: string
  status: "draft" | "published" | "closed"
} | null> {
  const [offer] = await db
    .select({
      companyId: internshipOffer.companyId,
      status: internshipOffer.status,
    })
    .from(internshipOffer)
    .where(eq(internshipOffer.id, offerId))
    .limit(1)
  return offer ?? null
}
