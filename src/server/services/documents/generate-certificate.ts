import "server-only"

import { renderToBuffer } from "@react-pdf/renderer"
import { and, eq } from "drizzle-orm"
import { createElement } from "react"
import { env } from "@/env"
import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { user } from "@/server/db/schema/auth"
import { company } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"
import { placement, placementDocument } from "@/server/db/schema/placements"
import { university } from "@/server/db/schema/universities"
import {
  type CertificateData,
  InternshipCertificateTemplate,
} from "@/server/pdfs/CertificateTemplate"
import { DocumentServiceError } from "@/server/services/documents/errors"
import { generateQRCodeDataUrl } from "@/server/services/documents/qr-utils"
import { generateVerificationCode } from "@/server/services/documents/verification-code"

export interface GenerateCertificateInput {
  placementId: string
  locale?: string
}

export interface GenerateCertificateResult {
  success: boolean
  documentId: string
  buffer?: Buffer
}

export async function generateCertificate(
  input: GenerateCertificateInput,
): Promise<GenerateCertificateResult> {
  const { placementId, locale = "en" } = input

  const [placementRecord] = await db
    .select()
    .from(placement)
    .where(eq(placement.id, placementId))
    .limit(1)

  if (!placementRecord) {
    throw new DocumentServiceError("PLACEMENT_NOT_FOUND", "Placement not found")
  }

  const [app] = await db
    .select({
      applicationId: application.id,
      offerTitle: internshipOffer.title,
      offerInternshipType: internshipOffer.internshipType,
      companyName: company.name,
      studentName: user.name,
      studentEmail: user.email,
      studentUniversityId: user.universityId,
    })
    .from(application)
    .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
    .innerJoin(company, eq(internshipOffer.companyId, company.id))
    .innerJoin(user, eq(application.studentUserId, user.id))
    .where(eq(application.id, placementRecord.applicationId))
    .limit(1)

  if (!app) {
    throw new DocumentServiceError(
      "APPLICATION_NOT_FOUND",
      "Application not found",
    )
  }

  let uniName: string | null = null
  if (app.studentUniversityId) {
    const [uni] = await db
      .select({ name: university.name })
      .from(university)
      .where(eq(university.id, app.studentUniversityId))
      .limit(1)
    uniName = uni?.name ?? null
  }

  // Check for existing document to preserve verification code on regeneration
  const [existingDoc] = await db
    .select()
    .from(placementDocument)
    .where(
      and(
        eq(placementDocument.placementId, placementId),
        eq(placementDocument.type, "certificate"),
      ),
    )
    .limit(1)

  let verificationCode = existingDoc?.verificationCode ?? generateVerificationCode()

  const data: CertificateData = {
    studentName: app.studentName ?? "Unknown",
    studentEmail: app.studentEmail,
    universityName: uniName,
    companyName: app.companyName,
    offerTitle: app.offerTitle,
    internshipType: app.offerInternshipType,
    startDate: placementRecord.startDate,
    endDate: placementRecord.endDate,
  }

  const renderCertificatePdf = async (code: string) => {
    const verificationUrl = `${env.NEXT_PUBLIC_BETTER_AUTH_URL}/${locale}/verify/${code}`
    const qrCodeDataUrl = await generateQRCodeDataUrl(verificationUrl)

    return renderToBuffer(
      createElement(InternshipCertificateTemplate, {
        data,
        locale,
        verificationCode: code,
        qrCodeDataUrl,
      }) as unknown as Parameters<typeof renderToBuffer>[0],
    )
  }

  let pdfBuffer = await renderCertificatePdf(verificationCode)

  const nextMeta = {
    generatedAt: new Date().toISOString(),
    locale,
    fileName: `certificate_${placementId}.pdf`,
  }

  let documentRecord = existingDoc

  if (documentRecord) {
    await db
      .update(placementDocument)
      .set({
        status: "generated",
        verificationCode,
        meta: nextMeta,
      })
      .where(eq(placementDocument.id, documentRecord.id))
  } else {
    const [insertedDoc] = await db
      .insert(placementDocument)
      .values({
        id: crypto.randomUUID(),
        placementId,
        type: "certificate",
        status: "generated",
        verificationCode,
        meta: nextMeta,
      })
      .onConflictDoNothing({
        target: [placementDocument.placementId, placementDocument.type],
      })
      .returning()

    if (insertedDoc) {
      documentRecord = insertedDoc
    } else {
      const [resolvedDoc] = await db
        .select()
        .from(placementDocument)
        .where(
          and(
            eq(placementDocument.placementId, placementId),
            eq(placementDocument.type, "certificate"),
          ),
        )
        .limit(1)

      if (!resolvedDoc) {
        throw new DocumentServiceError(
          "DOCUMENT_CONFLICT_RESOLUTION_FAILED",
          "Failed to resolve generated certificate document",
        )
      }

      documentRecord = resolvedDoc
      const resolvedVerificationCode =
        resolvedDoc.verificationCode ?? verificationCode

      if (resolvedVerificationCode !== verificationCode) {
        verificationCode = resolvedVerificationCode
        pdfBuffer = await renderCertificatePdf(verificationCode)
      }

      await db
        .update(placementDocument)
        .set({
          status: "generated",
          verificationCode,
          meta: nextMeta,
        })
        .where(eq(placementDocument.id, documentRecord.id))
    }
  }

  if (!documentRecord) {
    throw new DocumentServiceError(
      "DOCUMENT_CONFLICT_RESOLUTION_FAILED",
      "Failed to resolve generated certificate document",
    )
  }

  return {
    success: true,
    documentId: documentRecord.id,
    buffer: Buffer.from(pdfBuffer),
  }
}
