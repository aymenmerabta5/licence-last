import "server-only"

import { and, eq, inArray, isNotNull } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { user } from "@/server/db/schema/auth"
import { company } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"
import { skillTag } from "@/server/db/schema/skills"
import { studentProfile, studentSkill } from "@/server/db/schema/students"
import { university } from "@/server/db/schema/universities"
import type {
  ListPendingViewer,
  PendingApplication,
} from "@/server/services/placements/list-pending"

function hasNonEmptyProfileValue(value: string | null): boolean {
  return value !== null && value.trim().length > 0
}

export async function getPendingApplicationById(
  applicationId: string,
  viewer: ListPendingViewer,
): Promise<PendingApplication | null> {
  const { role, universityId, departmentId } = viewer

  if (role === "department_head" && !departmentId) {
    return null
  }

  if (role === "university_admin" && !universityId) {
    return null
  }

  const conditions = [
    eq(application.id, applicationId),
    eq(application.status, "company_accepted"),
    isNotNull(application.companyActionAt),
  ]

  if (role === "department_head") {
    conditions.push(eq(studentProfile.departmentId, departmentId!))
  } else if (role !== "super_admin") {
    conditions.push(eq(user.universityId, universityId!))
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
    .limit(1)

  const row = rows[0]
  if (!row) {
    return null
  }

  const studentSkills = await db
    .select({
      userId: studentSkill.userId,
      skillId: skillTag.id,
      skillName: skillTag.name,
      skillSlug: skillTag.slug,
      skillCategory: skillTag.category,
    })
    .from(studentSkill)
    .innerJoin(skillTag, eq(studentSkill.skillTagId, skillTag.id))
    .where(inArray(studentSkill.userId, [row.studentId]))

  const hasProfileData =
    hasNonEmptyProfileValue(row.profileBio) ||
    hasNonEmptyProfileValue(row.profilePhone) ||
    hasNonEmptyProfileValue(row.profileStudentNumber) ||
    hasNonEmptyProfileValue(row.profileDepartment) ||
    hasNonEmptyProfileValue(row.profileLevel) ||
    hasNonEmptyProfileValue(row.profileAddress)

  return {
    id: row.id,
    createdAt: row.createdAt,
    companyActionAt: row.companyActionAt ?? row.createdAt,
    coverLetter: row.coverLetter,
    student: {
      id: row.studentId,
      name: row.studentName,
      email: row.studentEmail,
      image: row.studentImage,
    },
    profile: hasProfileData
      ? {
          bio: row.profileBio,
          phone: row.profilePhone,
          studentNumber: row.profileStudentNumber,
          department: row.profileDepartment,
          level: row.profileLevel,
          address: row.profileAddress,
        }
      : null,
    university: row.universityId
      ? {
          id: row.universityId,
          name: row.universityName!,
          abbreviation: row.universityAbbreviation,
          departmentName: row.universityDepartmentName,
          address: row.universityAddress,
          city: row.universityCity,
          phone: row.universityPhone,
        }
      : null,
    offer: {
      id: row.offerId,
      title: row.offerTitle,
      internshipType: row.offerInternshipType,
      workMode: row.offerWorkMode,
      durationWeeks: row.offerDurationWeeks,
      wilayaCode: row.offerWilayaCode,
      applicationDeadlineAt: row.offerApplicationDeadlineAt,
      expectedStartDate: row.offerExpectedStartDate,
      expectedEndDate: row.offerExpectedEndDate,
    },
    company: {
      id: row.companyId,
      name: row.companyName,
      address: row.companyAddress,
      phone: row.companyPhone,
      representativeName: row.companyRepresentativeName,
      contactEmail: row.companyContactEmail,
    },
    skills: studentSkills.map((skill) => ({
      id: skill.skillId,
      name: skill.skillName,
      slug: skill.skillSlug,
      category: skill.skillCategory,
    })),
  }
}
