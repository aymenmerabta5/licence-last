import "server-only"

import { and, count, eq, ne, sql } from "drizzle-orm"
import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { company } from "@/server/db/schema/companies"
import {
  internshipOffer,
  internshipOfferSkill,
} from "@/server/db/schema/internships"
import { internshipOfferLanguageRequirement } from "@/server/db/schema/languages"
import { skillTag } from "@/server/db/schema/skills"

/**
 * Get an internship offer by ID, with its skills, company info, and application count.
 * Uses 2 queries: one for offer+company+count, one for skills.
 */
async function getOfferByIdUncached(offerId: string) {
  // Subquery to count non-withdrawn applications per offer
  const applicationCountSubquery = db
    .select({
      offerId: application.offerId,
      count: count().as("count"),
    })
    .from(application)
    .where(ne(application.status, "withdrawn"))
    .groupBy(application.offerId)
    .as("app_count")

  const [row] = await db
    .select({
      id: internshipOffer.id,
      companyId: internshipOffer.companyId,
      title: internshipOffer.title,
      description: internshipOffer.description,
      internshipType: internshipOffer.internshipType,
      workMode: internshipOffer.workMode,
      wilayaCode: internshipOffer.wilayaCode,
      durationWeeks: internshipOffer.durationWeeks,
      maxPositions: internshipOffer.maxPositions,
      status: internshipOffer.status,
      publishedAt: internshipOffer.publishedAt,
      applicationDeadlineAt: internshipOffer.applicationDeadlineAt,
      expectedStartDate: internshipOffer.expectedStartDate,
      expectedEndDate: internshipOffer.expectedEndDate,
      closesAt: internshipOffer.closesAt,
      createdAt: internshipOffer.createdAt,
      updatedAt: internshipOffer.updatedAt,
      companyName: company.name,
      companySlug: company.slug,
      companyStatus: company.status,
      companyLogoUrl: company.logoUrl,
      companyDescription: company.description,
      companyWilayaCode: company.wilayaCode,
      companyAddress: company.address,
      applicationCount: sql<
        number | null
      >`COALESCE(${applicationCountSubquery.count}, 0)`,
    })
    .from(internshipOffer)
    .innerJoin(company, eq(internshipOffer.companyId, company.id))
    .leftJoin(
      applicationCountSubquery,
      eq(internshipOffer.id, applicationCountSubquery.offerId),
    )
    .where(eq(internshipOffer.id, offerId))
    .limit(1)

  if (!row) return null

  const skills = await db
    .select({
      id: skillTag.id,
      name: skillTag.name,
      slug: skillTag.slug,
      category: skillTag.category,
    })
    .from(internshipOfferSkill)
    .innerJoin(skillTag, eq(internshipOfferSkill.skillTagId, skillTag.id))
    .where(eq(internshipOfferSkill.offerId, offerId))

  const languageRequirements = await db
    .select({
      languageCode: internshipOfferLanguageRequirement.languageCode,
      minimumProficiency: internshipOfferLanguageRequirement.minimumProficiency,
      isRequired: internshipOfferLanguageRequirement.isRequired,
      weight: internshipOfferLanguageRequirement.weight,
    })
    .from(internshipOfferLanguageRequirement)
    .where(eq(internshipOfferLanguageRequirement.offerId, offerId))

  return {
    ...row,
    skills,
    languageRequirements,
    applicationCount: row.applicationCount ?? 0,
  }
}

export async function getOfferById(offerId: string) {
  return getOfferByIdUncached(offerId)
}

/**
 * Check if a student has already applied to a specific offer.
 * Returns the application (id, status, createdAt) or null.
 */
export async function getStudentApplicationForOffer(
  offerId: string,
  studentUserId: string,
) {
  const [existing] = await db
    .select({
      id: application.id,
      status: application.status,
      createdAt: application.createdAt,
    })
    .from(application)
    .where(
      and(
        eq(application.offerId, offerId),
        eq(application.studentUserId, studentUserId),
      ),
    )
    .limit(1)

  return existing ?? null
}
