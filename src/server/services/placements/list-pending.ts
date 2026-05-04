import "server-only"

import { and, desc, eq, inArray, isNotNull, lt, or } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { user } from "@/server/db/schema/auth"
import { company } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"
import { skillTag } from "@/server/db/schema/skills"
import { studentProfile, studentSkill } from "@/server/db/schema/students"
import { university } from "@/server/db/schema/universities"

export interface PendingApplication {
  id: string
  createdAt: Date
  companyActionAt: Date
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
    applicationDeadlineAt: Date | null
    expectedStartDate: Date | null
    expectedEndDate: Date | null
  }
  company: {
    id: string
    name: string
    logoUrl: string | null
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
  nextCursor: { companyActionAt: string; id: string } | undefined
  hasMore: boolean
}

interface ListPendingParams {
  cursor?: { companyActionAt: string; id: string }
  limit?: number
}

export interface ListPendingViewer {
  role: "university_admin" | "department_head" | "super_admin"
  universityId: string | null
  /** Required when role is "department_head" */
  departmentId?: string | null
}

function hasNonEmptyProfileValue(value: string | null): boolean {
  return value !== null && value.trim().length > 0
}

export async function listPendingApplications(
  params: ListPendingParams = {},
  viewer: ListPendingViewer,
): Promise<ListPendingApplicationsResult> {
  const { cursor, limit = 20 } = params
  const { role, universityId, departmentId } = viewer

  // Dept heads must have a departmentId, admins must have a universityId.
  if (role === "department_head" && !departmentId) {
    return { applications: [], nextCursor: undefined, hasMore: false }
  }
  if (role === "university_admin" && !universityId) {
    return { applications: [], nextCursor: undefined, hasMore: false }
  }

  const conditions = [
    eq(application.status, "company_accepted"),
    // status implies this should exist, but keep pagination stable
    isNotNull(application.companyActionAt),
  ]

  if (role === "department_head") {
    // Dept head sees only students in their department
    conditions.push(eq(studentProfile.departmentId, departmentId!))
  } else if (role !== "super_admin") {
    // Admin sees all students in their university
    conditions.push(eq(user.universityId, universityId!))
  }

  if (cursor) {
    const cursorDate = new Date(cursor.companyActionAt)
    conditions.push(
      or(
        lt(application.companyActionAt, cursorDate),
        and(
          eq(application.companyActionAt, cursorDate),
          lt(application.id, cursor.id),
        ),
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
      offerApplicationDeadlineAt: internshipOffer.applicationDeadlineAt,
      offerExpectedStartDate: internshipOffer.expectedStartDate,
      offerExpectedEndDate: internshipOffer.expectedEndDate,
      companyId: company.id,
      companyName: company.name,
      companyLogoUrl: company.logoUrl,
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

  const studentIds = [...new Set(applications.map((a) => a.studentId))]

  // Get skills for all students
  const skillsByStudent = new Map<
    string,
    Array<{
      userId: string
      skillId: string
      skillName: string
      skillSlug: string
      skillCategory: string | null
    }>
  >()

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
      .where(inArray(studentSkill.userId, studentIds))

    for (const skill of allSkills) {
      const existing = skillsByStudent.get(skill.userId) ?? []
      existing.push(skill)
      skillsByStudent.set(skill.userId, existing)
    }
  }

  const result: PendingApplication[] = applications.map((app) => {
    const studentSkills = skillsByStudent.get(app.studentId) ?? []
    const hasProfileData =
      hasNonEmptyProfileValue(app.profileBio) ||
      hasNonEmptyProfileValue(app.profilePhone) ||
      hasNonEmptyProfileValue(app.profileStudentNumber) ||
      hasNonEmptyProfileValue(app.profileDepartment) ||
      hasNonEmptyProfileValue(app.profileLevel) ||
      hasNonEmptyProfileValue(app.profileAddress)

    return {
      id: app.id,
      createdAt: app.createdAt,
      companyActionAt: app.companyActionAt ?? app.createdAt,
      coverLetter: app.coverLetter,
      student: {
        id: app.studentId,
        name: app.studentName,
        email: app.studentEmail,
        image: app.studentImage,
      },
      profile: hasProfileData
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
        applicationDeadlineAt: app.offerApplicationDeadlineAt,
        expectedStartDate: app.offerExpectedStartDate,
        expectedEndDate: app.offerExpectedEndDate,
      },
      company: {
        id: app.companyId,
        name: app.companyName,
        logoUrl: app.companyLogoUrl,
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
      ? {
          companyActionAt: lastApp.companyActionAt.toISOString(),
          id: lastApp.id,
        }
      : undefined

  return { applications: result, nextCursor, hasMore }
}
