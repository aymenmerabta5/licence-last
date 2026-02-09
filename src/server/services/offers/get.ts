import "server-only"

import { eq, and, ne, count } from "drizzle-orm"

import { db } from "@/server/db"
import {
  internshipOffer,
  internshipOfferSkill,
} from "@/server/db/schema/internships"
import { company } from "@/server/db/schema/companies"
import { skillTag } from "@/server/db/schema/skills"
import { application } from "@/server/db/schema/applications"

/**
 * Get an internship offer by ID, with its skills, company info, and application count.
 */
export async function getOfferById(offerId: string) {
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
      closesAt: internshipOffer.closesAt,
      createdAt: internshipOffer.createdAt,
      updatedAt: internshipOffer.updatedAt,
      companyName: company.name,
      companySlug: company.slug,
      companyLogoUrl: company.logoUrl,
      companyDescription: company.description,
      companyWilayaCode: company.wilayaCode,
      companyAddress: company.address,
    })
    .from(internshipOffer)
    .innerJoin(company, eq(internshipOffer.companyId, company.id))
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

  // Count non-withdrawn applications
  const [countResult] = await db
    .select({ value: count() })
    .from(application)
    .where(
      and(
        eq(application.offerId, offerId),
        ne(application.status, "withdrawn"),
      ),
    )

  return {
    ...row,
    skills,
    applicationCount: countResult?.value ?? 0,
  }
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
