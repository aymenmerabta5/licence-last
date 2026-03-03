import "server-only"

import { and, desc, eq, lt, or } from "drizzle-orm"
import { cacheLife, cacheTag } from "next/cache"
import { CACHE_TAGS } from "@/lib/cache"
import type { ApplicationStatus, PipelineStage } from "@/lib/schemas/enums"
import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { company } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"

interface ListParams {
  status?: ApplicationStatus
  pipelineStage?: PipelineStage
  cursor?: { createdAt: string; id: string }
  limit: number
}

function isE2ECacheDisabled(): boolean {
  return process.env.E2E_DISABLE_CACHE === "1"
}

async function listApplicationsByStudentUncached(
  studentUserId: string,
  params: ListParams,
) {
  const { status, pipelineStage, cursor, limit } = params

  const conditions = [eq(application.studentUserId, studentUserId)]

  if (status) {
    conditions.push(eq(application.status, status))
  }

  if (pipelineStage) {
    conditions.push(eq(application.pipelineStage, pipelineStage))
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

async function listApplicationsByStudentCached(
  studentUserId: string,
  params: ListParams,
) {
  "use cache"
  cacheLife("minutes")
  cacheTag(CACHE_TAGS.STUDENT_APPLICATIONS(studentUserId))

  return listApplicationsByStudentUncached(studentUserId, params)
}

/**
 * List a student's applications with offer + company info.
 * Uses cache by default and bypasses it in E2E mode.
 */
export async function listApplicationsByStudent(
  studentUserId: string,
  params: ListParams,
) {
  if (isE2ECacheDisabled()) {
    return listApplicationsByStudentUncached(studentUserId, params)
  }

  return listApplicationsByStudentCached(studentUserId, params)
}
