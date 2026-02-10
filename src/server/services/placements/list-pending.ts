import "server-only"

import { eq, and, desc } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { internshipOffer } from "@/server/db/schema/internships"
import { user } from "@/server/db/schema/auth"
import { studentProfile, studentSkill } from "@/server/db/schema/students"
import { skillTag } from "@/server/db/schema/skills"
import { university } from "@/server/db/schema/universities"
import { company } from "@/server/db/schema/companies"

export interface PendingApplication {
  id: string
  createdAt: Date
  companyActionAt: Date | null
  coverLetter: string | null
  student: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  profile: {
    bio: string | null
    phone: string | null
    studentNumber: string | null
    department: string | null
    level: string | null
    address: string | null
  } | null
  university: {
    id: string
    name: string
    abbreviation: string | null
    departmentName: string | null
    deanName: string | null
    address: string | null
    city: string | null
    phone: string | null
  } | null
  offer: {
    id: string
    title: string
    internshipType: string
    workMode: string | null
    durationWeeks: number | null
    wilayaCode: number | null
  }
  company: {
    id: string
    name: string
    address: string | null
    phone: string | null
    representativeName: string | null
    contactEmail: string | null
  }
  skills: Array<{
    id: string
    name: string
    slug: string
    category: string | null
  }>
}

export interface ListPendingApplicationsResult {
  applications: PendingApplication[]
  nextCursor: { createdAt: string; id: string } | undefined
  hasMore: boolean
}

interface ListPendingParams {
  cursor?: { createdAt: string; id: string }
  limit?: number
}

export async function listPendingApplications(
  params: ListPendingParams = {},
): Promise<ListPendingApplicationsResult> {
  const { cursor, limit = 20 } = params

  const conditions = [eq(application.status, "company_accepted")]

  if (cursor) {
    conditions.push(
      and(
        desc(application.companyActionAt),
        eq(application.id, cursor.id),
      )!,
    )
  }

  const rows = await db
    .select({
      id: application.id,
      createdAt: application.createdAt,
      companyActionAt: application.companyActionAt,
      coverLetter: application.coverLetter,
      studentId: user.id,
      studentName: user.name,
      studentEmail: user.email,
      studentImage: user.image,
      universityId: university.id,
      universityName: university.name,
      universityAbbreviation: university.abbreviation,
      universityDepartmentName: university.departmentName,
      universityDeanName: university.deanName,
      universityAddress: university.address,
      universityCity: university.city,
      universityPhone: university.phone,
      profileBio: studentProfile.bio,
      profilePhone: studentProfile.phone,
      profileStudentNumber: studentProfile.studentNumber,
      profileDepartment: studentProfile.department,
      profileLevel: studentProfile.level,
      profileAddress: studentProfile.address,
      offerId: internshipOffer.id,
      offerTitle: internshipOffer.title,
      offerInternshipType: internshipOffer.internshipType,
      offerWorkMode: internshipOffer.workMode,
      offerDurationWeeks: internshipOffer.durationWeeks,
      offerWilayaCode: internshipOffer.wilayaCode,
      companyId: company.id,
      companyName: company.name,
      companyAddress: company.address,
      companyPhone: company.phone,
      companyRepresentativeName: company.representativeName,
      companyContactEmail: company.contactEmail,
    })
    .from(application)
    .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
    .innerJoin(company, eq(internshipOffer.companyId, company.id))
    .innerJoin(user, eq(application.studentUserId, user.id))
    .leftJoin(studentProfile, eq(user.id, studentProfile.userId))
    .leftJoin(university, eq(user.universityId, university.id))
    .where(and(...conditions))
    .orderBy(desc(application.companyActionAt), desc(application.id))
    .limit(limit + 1)

  const hasMore = rows.length > limit
  const applications = hasMore ? rows.slice(0, limit) : rows

  const studentIds = applications.map((a) => a.studentId)

  // Get skills for all students
  const skillsByStudent = new Map<string, Array<{
    userId: string
    skillId: string
    skillName: string
    skillSlug: string
    skillCategory: string | null
  }>>()

  if (studentIds.length > 0) {
    const allSkills = await db
      .select({
        userId: studentSkill.userId,
        skillId: skillTag.id,
        skillName: skillTag.name,
        skillSlug: skillTag.slug,
        skillCategory: skillTag.category,
      })
      .from(studentSkill)
      .innerJoin(skillTag, eq(studentSkill.skillTagId, skillTag.id))
      .where(eq(studentSkill.userId, studentIds[0]!))

    for (const skill of allSkills) {
      const existing = skillsByStudent.get(skill.userId) ?? []
      existing.push(skill)
      skillsByStudent.set(skill.userId, existing)
    }

    // Fetch skills for remaining students
    for (let i = 1; i < studentIds.length; i++) {
      const studentId = studentIds[i]
      if (studentId) {
        const skills = await db
          .select({
            userId: studentSkill.userId,
            skillId: skillTag.id,
            skillName: skillTag.name,
            skillSlug: skillTag.slug,
            skillCategory: skillTag.category,
          })
          .from(studentSkill)
          .innerJoin(skillTag, eq(studentSkill.skillTagId, skillTag.id))
          .where(eq(studentSkill.userId, studentId))
        
        skillsByStudent.set(studentId, skills)
      }
    }
  }

  const result: PendingApplication[] = applications.map((app) => {
    const studentSkills = skillsByStudent.get(app.studentId) ?? []

    return {
      id: app.id,
      createdAt: app.createdAt,
      companyActionAt: app.companyActionAt,
      coverLetter: app.coverLetter,
      student: {
        id: app.studentId,
        name: app.studentName,
        email: app.studentEmail,
        image: app.studentImage,
      },
      profile: app.profileBio
        ? {
            bio: app.profileBio,
            phone: app.profilePhone,
            studentNumber: app.profileStudentNumber,
            department: app.profileDepartment,
            level: app.profileLevel,
            address: app.profileAddress,
          }
        : null,
      university: app.universityId
        ? {
            id: app.universityId,
            name: app.universityName!,
            abbreviation: app.universityAbbreviation,
            departmentName: app.universityDepartmentName,
            deanName: app.universityDeanName,
            address: app.universityAddress,
            city: app.universityCity,
            phone: app.universityPhone,
          }
        : null,
      offer: {
        id: app.offerId,
        title: app.offerTitle,
        internshipType: app.offerInternshipType,
        workMode: app.offerWorkMode,
        durationWeeks: app.offerDurationWeeks,
        wilayaCode: app.offerWilayaCode,
      },
      company: {
        id: app.companyId,
        name: app.companyName,
        address: app.companyAddress,
        phone: app.companyPhone,
        representativeName: app.companyRepresentativeName,
        contactEmail: app.companyContactEmail,
      },
      skills: studentSkills.map((s) => ({
        id: s.skillId,
        name: s.skillName,
        slug: s.skillSlug,
        category: s.skillCategory,
      })),
    }
  })

  const lastApp = result[result.length - 1]
  const nextCursor =
    hasMore && lastApp
      ? { createdAt: lastApp.createdAt.toISOString(), id: lastApp.id }
      : undefined

  return { applications: result, nextCursor, hasMore }
}
