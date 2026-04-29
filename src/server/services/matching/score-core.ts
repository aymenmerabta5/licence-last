import "server-only"

import {
  MATCH_FAIRNESS_NOTES,
  MATCH_SCORING_VERSION,
  MATCH_WEIGHT,
  PROFIENCY_RANK,
} from "@/server/services/matching/constants"

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

export function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export interface ScoringInputs {
  offer: {
    id: string
    wilayaCode: number | null
    workMode: "on_site" | "hybrid" | "remote" | null
  }
  profile: {
    wilayaCode: number | null
    bio: string | null
    phone: string | null
    githubUrl: string | null
    portfolioUrl: string | null
    department: string | null
    level: string | null
  } | null
  offerSkills: Array<{
    id: string
    name: string
    slug: string
    category: string | null
  }>
  studentSkills: Array<{
    id: string
    name: string
    slug: string
    category: string | null
  }>
  languageReqs: Array<{
    languageCode: string
    minimumProficiency: string
    isRequired: boolean
    weight: number
  }>
  languages: Array<{
    languageCode: string
    proficiency: string
  }>
}

export function computeExplainableMatchScore(
  inputs: ScoringInputs,
): MatchScoreResult {
  const { offer, profile, offerSkills, studentSkills, languageReqs, languages } =
    inputs

  const studentSkillIds = new Set(studentSkills.map((skill) => skill.id))
  const matchedSkills = offerSkills.filter((skill) =>
    studentSkillIds.has(skill.id),
  )
  const missingSkills = offerSkills.filter(
    (skill) => !studentSkillIds.has(skill.id),
  )

  const skillsScore =
    offerSkills.length === 0
      ? MATCH_WEIGHT.skills
      : Math.round(
          (matchedSkills.length / offerSkills.length) * MATCH_WEIGHT.skills,
        )

  const languageByCode = new Map(
    languages.map((entry) => [
      entry.languageCode.toLowerCase(),
      entry.proficiency,
    ]),
  )

  let languageScore: number = MATCH_WEIGHT.language
  let languageMet = 0
  let requiredLanguageCount = 0
  let requiredLanguageMet = 0
  if (languageReqs.length > 0) {
    const totalWeight = languageReqs.reduce(
      (sum, req) => sum + Math.max(1, req.weight),
      0,
    )
    const metWeight = languageReqs.reduce((sum, req) => {
      const level = languageByCode.get(req.languageCode.toLowerCase())
      if (!level) return sum
      const studentRank = PROFIENCY_RANK[level as ProficiencyLevel] ?? 0
      const requiredRank =
        PROFIENCY_RANK[req.minimumProficiency as ProficiencyLevel] ?? 0
      return studentRank >= requiredRank ? sum + Math.max(1, req.weight) : sum
    }, 0)

    const requiredReqs = languageReqs.filter((req) => req.isRequired)
    requiredLanguageCount = requiredReqs.length
    requiredLanguageMet = requiredReqs.reduce((count, req) => {
      const level = languageByCode.get(req.languageCode.toLowerCase())
      if (!level) return count
      const studentRank = PROFIENCY_RANK[level as ProficiencyLevel] ?? 0
      const requiredRank =
        PROFIENCY_RANK[req.minimumProficiency as ProficiencyLevel] ?? 0
      return studentRank >= requiredRank ? count + 1 : count
    }, 0)

    languageMet = metWeight
    const baseLanguageScore =
      totalWeight > 0
        ? Math.round((metWeight / totalWeight) * MATCH_WEIGHT.language)
        : MATCH_WEIGHT.language

    if (requiredLanguageCount > 0) {
      const requiredMissRatio =
        (requiredLanguageCount - requiredLanguageMet) / requiredLanguageCount
      const requiredPenalty = Math.round(
        requiredMissRatio * (MATCH_WEIGHT.language * 0.5),
      )
      languageScore = Math.max(0, baseLanguageScore - requiredPenalty)
    } else {
      languageScore = baseLanguageScore
    }
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

  const total = clampScore(
    skillsScore + languageScore + locationScore + profileScore,
  )
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
          : `${languageMet}/${languageReqs.reduce((sum, req) => sum + Math.max(1, req.weight), 0)} weighted requirements met${requiredLanguageCount > 0 ? ` (${requiredLanguageMet}/${requiredLanguageCount} required languages met)` : ""}.`,
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
