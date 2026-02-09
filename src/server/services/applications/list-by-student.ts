import "server-only"

import { eq, and, desc, lt, or } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { internshipOffer } from "@/server/db/schema/internships"
import { company } from "@/server/db/schema/companies"

type ApplicationStatus =
  | "applied"
  | "company_accepted"
  | "company_refused"
  | "admin_validated"
  | "admin_rejected"
  | "withdrawn"

interface ListParams {
  status?: ApplicationStatus
  cursor?: { createdAt: string; id: string }
  limit: number
}

/**
 * List a student's applications with offer + company info.
 * Supports cursor pagination and optional status filter.
 */
export async function listApplicationsByStudent(
  studentUserId: string,
  params: ListParams,
) {
  const { status, cursor, limit } = params

  const conditions = [eq(application.studentUserId, studentUserId)]

  if (status) {
    conditions.push(eq(application.status, status))
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
      coverLetter: application.coverLetter,
      createdAt: application.createdAt,
      offerId: internshipOffer.id,
      offerTitle: internshipOffer.title,
      offerInternshipType: internshipOffer.internshipType,
      offerWorkMode: internshipOffer.workMode,
      offerWilayaCode: internshipOffer.wilayaCode,
      companyName: company.name,
      companySlug: company.slug,
      companyLogoUrl: company.logoUrl,
    })
    .from(application)
    .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
    .innerJoin(company, eq(internshipOffer.companyId, company.id))
    .where(and(...conditions))
    .orderBy(desc(application.createdAt), desc(application.id))
    .limit(limit + 1)

  const hasMore = rows.length > limit
  const applications = hasMore ? rows.slice(0, limit) : rows

  const lastApp = applications[applications.length - 1]
  const nextCursor =
    hasMore && lastApp
      ? { createdAt: lastApp.createdAt.toISOString(), id: lastApp.id }
      : undefined

  return { applications, nextCursor, hasMore }
}
