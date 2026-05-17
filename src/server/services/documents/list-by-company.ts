import "server-only"

import { and, desc, eq, ilike, inArray, sql } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { user } from "@/server/db/schema/auth"
import { internshipOffer } from "@/server/db/schema/internships"
import { placement, placementDocument } from "@/server/db/schema/placements"

export interface CompanyDocumentItem {
  id: string
  type: "agreement" | "certificate"
  status: "pending" | "generated" | "failed"
  locale: string
  borderStyle: string
  verificationCode: string | null
  createdAt: Date
  meta: unknown
}

export interface CompanyPlacementWithDocuments {
  placementId: string
  applicationId: string
  offerId: string
  offerTitle: string
  internshipType: string
  studentUserId: string
  studentName: string | null
  studentEmail: string
  startDate: Date
  endDate: Date
  validatedAt: Date
  documents: CompanyDocumentItem[]
}

export interface ListDocumentsByCompanyResult {
  placements: CompanyPlacementWithDocuments[]
  nextCursor: { validatedAt: string; placementId: string } | null
}

export async function listDocumentsByCompany(
  companyId: string,
  options?: {
    cursor?: { validatedAt: string; placementId: string }
    limit?: number
    search?: string
  },
): Promise<ListDocumentsByCompanyResult> {
  const limit = options?.limit ?? 12
  const search = options?.search?.trim()

  const whereConditions = [
    eq(internshipOffer.companyId, companyId),
    eq(application.status, "admin_validated"),
  ] as const

  let searchUserIds: string[] | undefined

  if (search) {
    const matchingUsers = await db
      .select({ id: user.id })
      .from(user)
      .where(
        sql`(${ilike(user.name, `%${search}%`)} OR ${ilike(user.email, `%${search}%`)})`,
      )
      .limit(100)

    if (matchingUsers.length === 0) {
      return { placements: [], nextCursor: null }
    }

    searchUserIds = matchingUsers.map((u) => u.id)
  }

  const cursorCondition = options?.cursor
    ? sql`${placement.validatedAt} < ${options.cursor.validatedAt} OR (${placement.validatedAt} = ${options.cursor.validatedAt} AND ${placement.id} < ${options.cursor.placementId})`
    : undefined

  const query = db
    .select({
      placementId: placement.id,
      applicationId: application.id,
      offerId: internshipOffer.id,
      offerTitle: internshipOffer.title,
      internshipType: internshipOffer.internshipType,
      studentUserId: application.studentUserId,
      studentName: user.name,
      studentEmail: user.email,
      startDate: placement.startDate,
      endDate: placement.endDate,
      validatedAt: placement.validatedAt,
    })
    .from(placement)
    .innerJoin(application, eq(placement.applicationId, application.id))
    .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
    .innerJoin(user, eq(application.studentUserId, user.id))
    .where(
      and(
        ...whereConditions,
        searchUserIds
          ? inArray(application.studentUserId, searchUserIds)
          : undefined,
        cursorCondition,
      ),
    )
    .orderBy(desc(placement.validatedAt), desc(placement.id))
    .limit(limit + 1)

  const placements = await query

  if (placements.length === 0) {
    return { placements: [], nextCursor: null }
  }

  const hasMore = placements.length > limit
  const pagePlacements = hasMore ? placements.slice(0, limit) : placements

  const placementIds = pagePlacements.map((item) => item.placementId)
  const docs = await db
    .select({
      id: placementDocument.id,
      placementId: placementDocument.placementId,
      type: placementDocument.type,
      status: placementDocument.status,
      locale: placementDocument.locale,
      borderStyle: placementDocument.borderStyle,
      verificationCode: placementDocument.verificationCode,
      createdAt: placementDocument.createdAt,
      meta: placementDocument.meta,
    })
    .from(placementDocument)
    .where(inArray(placementDocument.placementId, placementIds))
    .orderBy(desc(placementDocument.createdAt))

  const docsByPlacement = new Map<string, CompanyDocumentItem[]>()
  for (const doc of docs) {
    const current = docsByPlacement.get(doc.placementId) ?? []
    current.push({
      id: doc.id,
      type: doc.type,
      status: doc.status,
      locale: doc.locale,
      borderStyle: doc.borderStyle,
      verificationCode: doc.verificationCode,
      createdAt: doc.createdAt,
      meta: doc.meta,
    })
    docsByPlacement.set(doc.placementId, current)
  }

  const mappedPlacements = pagePlacements.map((item) => ({
    ...item,
    documents: docsByPlacement.get(item.placementId) ?? [],
  }))

  const lastPlacement = pagePlacements[pagePlacements.length - 1]
  const nextCursor = hasMore
    ? {
        validatedAt: lastPlacement.validatedAt.toISOString(),
        placementId: lastPlacement.placementId,
      }
    : null

  return { placements: mappedPlacements, nextCursor }
}
