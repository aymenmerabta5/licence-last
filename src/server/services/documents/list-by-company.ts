import "server-only"

import { and, desc, eq, inArray } from "drizzle-orm"

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

export async function listDocumentsByCompany(
  companyId: string,
): Promise<CompanyPlacementWithDocuments[]> {
  const placements = await db
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
        eq(internshipOffer.companyId, companyId),
        eq(application.status, "admin_validated"),
      ),
    )
    .orderBy(desc(placement.validatedAt))

  if (placements.length === 0) {
    return []
  }

  const placementIds = placements.map((item) => item.placementId)
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
    })
    docsByPlacement.set(doc.placementId, current)
  }

  return placements.map((item) => ({
    ...item,
    documents: docsByPlacement.get(item.placementId) ?? [],
  }))
}
