import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { user } from "@/server/db/schema/auth"
import { company } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"
import { placement, placementDocument } from "@/server/db/schema/placements"
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

function toMetaRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }

  return {}
}

function toSnapshotRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }

  return null
}

export async function verifyDocument(
  code: string,
): Promise<VerifyDocumentResult> {
  const normalizedCode = code.trim().toUpperCase()

  const [doc] = await db
    .select({
      documentType: placementDocument.type,
      documentStatus: placementDocument.status,
      meta: placementDocument.meta,
      snapshotData: placementDocument.snapshotData,
      placementId: placementDocument.placementId,
      createdAt: placementDocument.createdAt,
    })
    .from(placementDocument)
    .where(eq(placementDocument.verificationCode, normalizedCode))
    .limit(1)

  if (!doc) {
    return { valid: false }
  }

  const meta = toMetaRecord(doc.meta)
  const snapshot = toSnapshotRecord(doc.snapshotData)

  if (snapshot) {
    const startDate = snapshot.startDate
    const endDate = snapshot.endDate

    return {
      valid: true,
      documentType: doc.documentType as "agreement" | "certificate",
      documentStatus: doc.documentStatus,
      studentName:
        (typeof snapshot.studentName === "string"
          ? snapshot.studentName
          : null) ?? "Unknown",
      companyName:
        (typeof snapshot.companyName === "string"
          ? snapshot.companyName
          : null) ?? "Unknown",
      universityName:
        typeof snapshot.universityName === "string"
          ? snapshot.universityName
          : null,
      offerTitle:
        (typeof snapshot.offerTitle === "string"
          ? snapshot.offerTitle
          : null) ?? "Unknown",
      startDate:
        startDate instanceof Date ? startDate : new Date(startDate as string),
      endDate: endDate instanceof Date ? endDate : new Date(endDate as string),
      generatedAt:
        (typeof meta.generatedAt === "string" ? meta.generatedAt : null) ??
        doc.createdAt.toISOString(),
    }
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
    generatedAt:
      (typeof meta.generatedAt === "string" ? meta.generatedAt : null) ??
      doc.createdAt.toISOString(),
  }
}
