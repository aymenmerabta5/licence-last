import "server-only"

import { and, desc, eq, inArray, lt, or, sql } from "drizzle-orm"
import type { ApplicationStatus, PipelineStage } from "@/lib/schemas/enums"
import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { user } from "@/server/db/schema/auth"
import {
  internshipOffer,
  internshipOfferSkill,
} from "@/server/db/schema/internships"
import { studentLanguage } from "@/server/db/schema/languages"
import { skillTag } from "@/server/db/schema/skills"
import { studentProfile, studentSkill } from "@/server/db/schema/students"
import { university } from "@/server/db/schema/universities"
import { ApplicationServiceError } from "@/server/services/applications/errors"

interface ListParams {
  status?: ApplicationStatus
  pipelineStage?: PipelineStage
  skillTagIds?: string[]
  languageCodes?: string[]
  cursor?: { createdAt: string; id: string }
  limit?: number
}

export interface ApplicationWithStudent {
  id: string
  status: ApplicationStatus
  pipelineStage:
    | "applied"
    | "screening"
    | "interview"
    | "offer"
    | "accepted"
    | "rejected"
  coverLetter: string | null
  createdAt: Date
  companyActionAt: Date | null
  companyNote: string | null
  student: {
    id: string
    name: string | null
    image: string | null
    email: string | null
  }
  profile: {
    bio: string | null
    phone: string | null
    githubUrl: string | null
    portfolioUrl: string | null
    level: string | null
    department: string | null
  } | null
  university: {
    name: string
    abbreviation: string | null
  } | null
  skills: Array<{
    id: string
    name: string
    slug: string
    category: string | null
  }>
  languages: Array<{
    languageCode: string
    proficiency: string
  }>
  skillMatchPercentage: number
}

export interface ListApplicationsByOfferResult {
  applications: ApplicationWithStudent[]
  nextCursor: { createdAt: string; id: string } | undefined
  hasMore: boolean
}

function hasNonEmptyProfileValue(value: string | null): boolean {
  return value !== null && value.trim().length > 0
}

export async function listApplicationsByOffer(
  offerId: string,
  companyId: string,
  params: ListParams = {},
): Promise<ListApplicationsByOfferResult> {
  const {
    status,
    pipelineStage,
    skillTagIds,
    languageCodes,
    cursor,
    limit = 20,
  } = params

  const [offer] = await db
    .select({ id: internshipOffer.id, companyId: internshipOffer.companyId })
    .from(internshipOffer)
    .where(eq(internshipOffer.id, offerId))
    .limit(1)

  if (!offer) {
    throw new ApplicationServiceError("OFFER_NOT_FOUND", "Offer not found")
  }

  if (offer.companyId !== companyId) {
    throw new ApplicationServiceError(
      "OFFER_FORBIDDEN",
      "You do not have access to this offer",
    )
  }

  const offerSkills = await db
    .select({ skillTagId: internshipOfferSkill.skillTagId })
    .from(internshipOfferSkill)
    .where(eq(internshipOfferSkill.offerId, offerId))

  const offerSkillIds = new Set(offerSkills.map((s) => s.skillTagId))

  const conditions = [eq(application.offerId, offerId)]

  if (status) {
    conditions.push(eq(application.status, status))
  }

  if (pipelineStage) {
    conditions.push(eq(application.pipelineStage, pipelineStage))
  }

  if (skillTagIds && skillTagIds.length > 0) {
    conditions.push(
      sql`${application.studentUserId} IN (
        SELECT ${studentSkill.userId}
        FROM ${studentSkill}
        WHERE ${inArray(studentSkill.skillTagId, skillTagIds)}
      )`,
    )
  }

  if (languageCodes && languageCodes.length > 0) {
    conditions.push(
      sql`${application.studentUserId} IN (
        SELECT ${studentLanguage.userId}
        FROM ${studentLanguage}
        WHERE ${inArray(studentLanguage.languageCode, languageCodes)}
      )`,
    )
  }

  if (cursor) {
    const cursorDate = new Date(cursor.createdAt)
    conditions.push(
      or(
        lt(application.createdAt, cursorDate),
        and(
          eq(application.createdAt, cursorDate),
          lt(application.id, cursor.id),
        ),
      )!,
    )
  }

  const rows = await db
    .select({
      id: application.id,
      status: application.status,
      pipelineStage: application.pipelineStage,
      coverLetter: application.coverLetter,
      createdAt: application.createdAt,
      companyActionAt: application.companyActionAt,
      companyNote: application.companyNote,
      studentId: user.id,
      studentName: user.name,
      studentImage: user.image,
      studentEmail: user.email,
      universityId: university.id,
      universityName: university.name,
      universityAbbreviation: university.abbreviation,
      profileBio: studentProfile.bio,
      profilePhone: studentProfile.phone,
      profileGithubUrl: studentProfile.githubUrl,
      profilePortfolioUrl: studentProfile.portfolioUrl,
      profileLevel: studentProfile.level,
      profileDepartment: studentProfile.department,
    })
    .from(application)
    .innerJoin(user, eq(application.studentUserId, user.id))
    .leftJoin(studentProfile, eq(user.id, studentProfile.userId))
    .leftJoin(university, eq(user.universityId, university.id))
    .where(and(...conditions))
    .orderBy(desc(application.createdAt), desc(application.id))
    .limit(limit + 1)

  const hasMore = rows.length > limit
  const applications = hasMore ? rows.slice(0, limit) : rows

  const studentIds = applications.map((a) => a.studentId)

  const allStudentSkills =
    studentIds.length > 0
      ? await db
          .select({
            userId: studentSkill.userId,
            skillId: skillTag.id,
            skillName: skillTag.name,
            skillSlug: skillTag.slug,
            skillCategory: skillTag.category,
          })
          .from(studentSkill)
          .innerJoin(skillTag, eq(studentSkill.skillTagId, skillTag.id))
          .where(inArray(studentSkill.userId, studentIds))
      : []

  const allStudentLanguages =
    studentIds.length > 0
      ? await db
          .select({
            userId: studentLanguage.userId,
            languageCode: studentLanguage.languageCode,
            proficiency: studentLanguage.proficiency,
          })
          .from(studentLanguage)
          .where(inArray(studentLanguage.userId, studentIds))
      : []

  const skillsByStudent = new Map<string, typeof allStudentSkills>()
  for (const skill of allStudentSkills) {
    const existing = skillsByStudent.get(skill.userId) ?? []
    existing.push(skill)
    skillsByStudent.set(skill.userId, existing)
  }

  const languagesByStudent = new Map<string, typeof allStudentLanguages>()
  for (const language of allStudentLanguages) {
    const existing = languagesByStudent.get(language.userId) ?? []
    existing.push(language)
    languagesByStudent.set(language.userId, existing)
  }

  const result: ApplicationWithStudent[] = applications.map((app) => {
    const studentSkills = skillsByStudent.get(app.studentId) ?? []
    const studentLanguages = languagesByStudent.get(app.studentId) ?? []
    const studentSkillIds = new Set(studentSkills.map((s) => s.skillId))
    const hasProfileData =
      hasNonEmptyProfileValue(app.profileBio) ||
      hasNonEmptyProfileValue(app.profilePhone) ||
      hasNonEmptyProfileValue(app.profileGithubUrl) ||
      hasNonEmptyProfileValue(app.profilePortfolioUrl) ||
      hasNonEmptyProfileValue(app.profileLevel) ||
      hasNonEmptyProfileValue(app.profileDepartment)

    let matchPercentage = 0
    if (offerSkillIds.size > 0) {
      const matchedCount = [...studentSkillIds].filter((id) =>
        offerSkillIds.has(id),
      ).length
      matchPercentage = Math.round((matchedCount / offerSkillIds.size) * 100)
    }

    return {
      id: app.id,
      status: app.status as ApplicationStatus,
      pipelineStage: app.pipelineStage,
      coverLetter: app.coverLetter,
      createdAt: app.createdAt,
      companyActionAt: app.companyActionAt,
      companyNote: app.companyNote,
      student: {
        id: app.studentId,
        name: app.studentName,
        image: app.studentImage,
        email: app.studentEmail,
      },
      profile: hasProfileData
        ? {
            bio: app.profileBio,
            phone: app.profilePhone,
            githubUrl: app.profileGithubUrl,
            portfolioUrl: app.profilePortfolioUrl,
            level: app.profileLevel,
            department: app.profileDepartment,
          }
        : null,
      university: app.universityId
        ? {
            name: app.universityName!,
            abbreviation: app.universityAbbreviation,
          }
        : null,
      skills: studentSkills.map((s) => ({
        id: s.skillId,
        name: s.skillName,
        slug: s.skillSlug,
        category: s.skillCategory,
      })),
      languages: studentLanguages.map((language) => ({
        languageCode: language.languageCode,
        proficiency: language.proficiency,
      })),
      skillMatchPercentage: matchPercentage,
    }
  })

  const lastApp = result[result.length - 1]
  const nextCursor =
    hasMore && lastApp
      ? { createdAt: lastApp.createdAt.toISOString(), id: lastApp.id }
      : undefined

  return { applications: result, nextCursor, hasMore }
}
