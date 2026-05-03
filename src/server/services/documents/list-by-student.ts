import "server-only"

import { desc, eq, inArray } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { company } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"
import { placement, placementDocument } from "@/server/db/schema/placements"

export interface StudentDocumentItem {
  id: string
  type: "agreement" | "certificate"
  status: "pending" | "generated" | "failed"
  locale: string
  borderStyle: string
  verificationCode: string | null
  createdAt: Date
}

export interface StudentPlacementWithDocuments {
  placementId: string
  applicationId: string
  startDate: Date
  endDate: Date
  validatedAt: Date
  offerTitle: string
  internshipType: string
  companyName: string
  documents: StudentDocumentItem[]
}

export async function listDocumentsByStudent(
  studentUserId: string,
): Promise<StudentPlacementWithDocuments[]> {
  const placements = await db
    .select({
      placementId: placement.id,
      applicationId: application.id,
      startDate: placement.startDate,
      endDate: placement.endDate,
      validatedAt: placement.validatedAt,
      offerTitle: internshipOffer.title,
      internshipType: internshipOffer.internshipType,
      companyName: company.name,
    })
    .from(placement)
    .innerJoin(application, eq(placement.applicationId, application.id))
    .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
    .innerJoin(company, eq(internshipOffer.companyId, company.id))
    .where(eq(application.studentUserId, studentUserId))
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

  const docsByPlacement = new Map<string, StudentDocumentItem[]>()
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
