import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { internshipOffer, internshipOfferSkill } from "@/server/db/schema/internships"
import { skillTag } from "@/server/db/schema/skills"
import { studentProfile, studentSkill } from "@/server/db/schema/students"
import {
  internshipOfferLanguageRequirement,
  studentLanguage,
} from "@/server/db/schema/languages"

import {
  MATCH_FAIRNESS_NOTES,
  MATCH_SCORING_VERSION,
  MATCH_WEIGHT,
  PROFIENCY_RANK,
} from "./constants"

type ProficiencyLevel = keyof typeof PROFIENCY_RANK

export interface MatchReason {
  key:
    | "skills_match"
    | "skills_missing"
    | "language_match"
    | "location_alignment"
    | "profile_strength"
  title: string
  detail: string
  impact: number
}

export interface MatchScoreResult {
  score: number
  readinessPercent: number
  version: string
  reasons: MatchReason[]
  fairnessNotes: string[]
  breakdown: {
    skills: number
    language: number
    location: number
    profile: number
  }
  missingSkills: Array<{
    id: string
    name: string
    slug: string
    category: string | null
  }>
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

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
          minimumProficiency: internshipOfferLanguageRequirement.minimumProficiency,
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
    throw new Error("Offer not found")
  }

  const studentSkillIds = new Set(studentSkills.map((skill) => skill.id))
  const matchedSkills = offerSkills.filter((skill) => studentSkillIds.has(skill.id))
  const missingSkills = offerSkills.filter((skill) => !studentSkillIds.has(skill.id))

  const skillsScore =
    offerSkills.length === 0
      ? MATCH_WEIGHT.skills
      : Math.round((matchedSkills.length / offerSkills.length) * MATCH_WEIGHT.skills)

  const languageByCode = new Map(
    languages.map((entry) => [entry.languageCode.toLowerCase(), entry.proficiency]),
  )

  let languageScore: number = MATCH_WEIGHT.language
  let languageMet = 0
  if (languageReqs.length > 0) {
    const totalWeight = languageReqs.reduce((sum, req) => sum + Math.max(1, req.weight), 0)
    const metWeight = languageReqs.reduce((sum, req) => {
      const level = languageByCode.get(req.languageCode.toLowerCase())
      if (!level) return sum
      const studentRank = PROFIENCY_RANK[level as ProficiencyLevel] ?? 0
      const requiredRank = PROFIENCY_RANK[req.minimumProficiency as ProficiencyLevel] ?? 0
      return studentRank >= requiredRank ? sum + Math.max(1, req.weight) : sum
    }, 0)
    languageMet = metWeight
    languageScore =
      totalWeight > 0
        ? Math.round((metWeight / totalWeight) * MATCH_WEIGHT.language)
        : MATCH_WEIGHT.language
  }

  let locationScore: number = MATCH_WEIGHT.location
  if (offer.workMode !== "remote") {
    if (!profile?.wilayaCode || !offer.wilayaCode) {
      locationScore = Math.round(MATCH_WEIGHT.location * 0.45)
    } else if (profile.wilayaCode !== offer.wilayaCode) {
      locationScore =
        offer.workMode === "hybrid"
          ? Math.round(MATCH_WEIGHT.location * 0.55)
          : Math.round(MATCH_WEIGHT.location * 0.25)
    }
  }

  const profileSignals = [
    Boolean(profile?.bio),
    Boolean(profile?.phone),
    Boolean(profile?.githubUrl),
    Boolean(profile?.portfolioUrl),
    Boolean(profile?.department),
    Boolean(profile?.level),
    studentSkills.length >= 3,
  ]
  const profileRatio =
    profileSignals.filter(Boolean).length / Math.max(1, profileSignals.length)
  const profileScore = Math.round(profileRatio * MATCH_WEIGHT.profile)

  const total = clampScore(skillsScore + languageScore + locationScore + profileScore)
  const reasons: MatchReason[] = [
    {
      key: "skills_match",
      title: "Skills match",
      detail:
        offerSkills.length === 0
          ? "No mandatory skills listed on this offer."
          : `${matchedSkills.length}/${offerSkills.length} required skills matched.`,
      impact: skillsScore,
    },
    {
      key: "skills_missing",
      title: "Skill gaps",
      detail:
        missingSkills.length === 0
          ? "No required skill gaps detected."
          : `${missingSkills.length} required skills still missing.`,
      impact: -Math.max(0, MATCH_WEIGHT.skills - skillsScore),
    },
    {
      key: "language_match",
      title: "Language fit",
      detail:
        languageReqs.length === 0
          ? "No language requirement defined by the company."
          : `${languageMet}/${languageReqs.reduce((sum, req) => sum + Math.max(1, req.weight), 0)} weighted requirements met.`,
      impact: languageScore,
    },
    {
      key: "location_alignment",
      title: "Location and work mode",
      detail:
        offer.workMode === "remote"
          ? "Remote setup keeps location impact low."
          : "Location contributes as a soft compatibility signal.",
      impact: locationScore,
    },
    {
      key: "profile_strength",
      title: "Profile strength",
      detail: `${Math.round(profileRatio * 100)}% of profile readiness signals complete.`,
      impact: profileScore,
    },
  ]

  return {
    score: total,
    readinessPercent: total,
    version: MATCH_SCORING_VERSION,
    reasons,
    fairnessNotes: [...MATCH_FAIRNESS_NOTES],
    breakdown: {
      skills: skillsScore,
      language: languageScore,
      location: locationScore,
      profile: profileScore,
    },
    missingSkills,
  }
}

export function canAccessMatchScore(
  viewer: { id: string; role: string },
  params: {
    studentUserId: string
    offerCompanyId: string
    isOfferVisibleToStudent: boolean
    viewerCompanyId?: string
  },
) {
  if (viewer.role === "university_admin" || viewer.role === "super_admin") return true
  if (viewer.role === "student") {
    return viewer.id === params.studentUserId && params.isOfferVisibleToStudent
  }
  if (viewer.role === "company_admin") {
    return params.viewerCompanyId === params.offerCompanyId
  }
  return false
}

export async function getOfferAccessContext(offerId: string): Promise<{
  companyId: string
  status: "draft" | "published" | "closed"
} | null> {
  const [offer] = await db
    .select({ companyId: internshipOffer.companyId, status: internshipOffer.status })
    .from(internshipOffer)
    .where(eq(internshipOffer.id, offerId))
    .limit(1)
  return offer ?? null
}
