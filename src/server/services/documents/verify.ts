import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { placementDocument, placement } from "@/server/db/schema/placements"
import { application } from "@/server/db/schema/applications"
import { internshipOffer } from "@/server/db/schema/internships"
import { company } from "@/server/db/schema/companies"
import { user } from "@/server/db/schema/auth"
import { university } from "@/server/db/schema/universities"

export interface VerificationResult {
  valid: true
  documentType: "agreement" | "certificate"
  documentStatus: string
  studentName: string
  companyName: string
  universityName: string | null
  offerTitle: string
  startDate: Date
  endDate: Date
  generatedAt: string | null
}

export interface VerificationNotFound {
  valid: false
}

export type VerifyDocumentResult = VerificationResult | VerificationNotFound

/**
 * Looks up a document by its verification code and returns public-safe data.
 * No emails, phones, addresses, or internal IDs are exposed.
 */
export async function verifyDocument(code: string): Promise<VerifyDocumentResult> {
  const normalizedCode = code.trim().toUpperCase()

  const [doc] = await db
    .select({
      documentType: placementDocument.type,
      documentStatus: placementDocument.status,
      meta: placementDocument.meta,
      placementId: placementDocument.placementId,
    })
    .from(placementDocument)
    .where(eq(placementDocument.verificationCode, normalizedCode))
    .limit(1)

  if (!doc) {
    return { valid: false }
  }

  const [placementRecord] = await db
    .select({
      applicationId: placement.applicationId,
      startDate: placement.startDate,
      endDate: placement.endDate,
    })
    .from(placement)
    .where(eq(placement.id, doc.placementId))
    .limit(1)

  if (!placementRecord) {
    return { valid: false }
  }

  const [row] = await db
    .select({
      studentName: user.name,
      companyName: company.name,
      universityId: user.universityId,
      offerTitle: internshipOffer.title,
    })
    .from(application)
    .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
    .innerJoin(company, eq(internshipOffer.companyId, company.id))
    .innerJoin(user, eq(application.studentUserId, user.id))
    .where(eq(application.id, placementRecord.applicationId))
    .limit(1)

  if (!row) {
    return { valid: false }
  }

  let universityName: string | null = null
  if (row.universityId) {
    const [uni] = await db
      .select({ name: university.name })
      .from(university)
      .where(eq(university.id, row.universityId))
      .limit(1)
    universityName = uni?.name ?? null
  }

  const meta = doc.meta as Record<string, unknown> | null

  return {
    valid: true,
    documentType: doc.documentType as "agreement" | "certificate",
    documentStatus: doc.documentStatus,
    studentName: row.studentName ?? "Unknown",
    companyName: row.companyName,
    universityName,
    offerTitle: row.offerTitle,
    startDate: placementRecord.startDate,
    endDate: placementRecord.endDate,
    generatedAt: (meta?.generatedAt as string) ?? null,
  }
}
