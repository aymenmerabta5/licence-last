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
import { studentProfile } from "@/server/db/schema/students"
import { university } from "@/server/db/schema/universities"
import { logger } from "@/server/logging"
import {
  type AgreementData,
  ConventionDeStageTemplate,
} from "@/server/pdfs/AgreementTemplate"
import { DocumentServiceError } from "@/server/services/documents/errors"
import { generateQRCodeDataUrl } from "@/server/services/documents/qr-utils"
import { sendAgreementEmail } from "@/server/services/documents/send-agreement-email"
import { generateVerificationCode } from "@/server/services/documents/verification-code"
import { createNotification } from "@/server/services/notifications/create"

export interface GenerateAgreementInput {
  placementId: string
  locale?: string
}

export interface GenerateAgreementResult {
  success: boolean
  documentId: string
  buffer?: Buffer
}

export async function generateAgreement(
  input: GenerateAgreementInput,
): Promise<GenerateAgreementResult> {
  const { placementId, locale = "en" } = input

  const [placementRecord] = await db
    .select()
    .from(placement)
    .where(eq(placement.id, placementId))
    .limit(1)

  if (!placementRecord) {
    throw new DocumentServiceError("PLACEMENT_NOT_FOUND", "Placement not found")
  }

  const [row] = await db
    .select({
      applicationId: application.id,

      offerTitle: internshipOffer.title,
      internshipType: internshipOffer.internshipType,
      workMode: internshipOffer.workMode,
      durationWeeks: internshipOffer.durationWeeks,

      companyName: company.name,
      companyAddress: company.address,
      companyPhone: company.phone,
      companyRepresentativeName: company.representativeName,
      companyContactEmail: company.contactEmail,

      studentName: user.name,
      studentEmail: user.email,
      studentUserId: user.id,
      studentUniversityId: user.universityId,

      studentPhone: studentProfile.phone,
      studentNumber: studentProfile.studentNumber,
      studentDepartment: studentProfile.department,
      studentAddress: studentProfile.address,

      universityName: university.name,
      universityDepartmentName: university.departmentName,
      universityAddress: university.address,
      universityPhone: university.phone,
    })
    .from(application)
    .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
    .innerJoin(company, eq(internshipOffer.companyId, company.id))
    .innerJoin(user, eq(application.studentUserId, user.id))
    .leftJoin(studentProfile, eq(user.id, studentProfile.userId))
    .leftJoin(university, eq(user.universityId, university.id))
    .where(eq(application.id, placementRecord.applicationId))
    .limit(1)

  if (!row) {
    throw new DocumentServiceError(
      "APPLICATION_NOT_FOUND",
      "Application not found",
    )
  }

  // Check for existing document to preserve verification code on regeneration
  const [existingDoc] = await db
    .select()
    .from(placementDocument)
    .where(
      and(
        eq(placementDocument.placementId, placementId),
        eq(placementDocument.type, "agreement"),
      ),
    )
    .limit(1)

  let verificationCode = existingDoc?.verificationCode ?? generateVerificationCode()

  const data: AgreementData = {
    // Student info
    studentName: row.studentName ?? "Unknown",
    studentEmail: row.studentEmail,
    studentPhone: row.studentPhone ?? null,
    studentNumber: row.studentNumber ?? null,
    studentDepartment: row.studentDepartment ?? null,
    studentAddress: row.studentAddress ?? null,

    // Company info
    companyName: row.companyName,
    companyAddress: row.companyAddress ?? null,
    companyPhone: row.companyPhone ?? null,
    companyRepresentativeName: row.companyRepresentativeName ?? null,
    companyContactEmail: row.companyContactEmail ?? null,

    // University info
    universityName: row.universityName ?? null,
    universityDepartmentName: row.universityDepartmentName ?? null,
    universityAddress: row.universityAddress ?? null,
    universityPhone: row.universityPhone ?? null,

    // Placement info
    offerTitle: row.offerTitle,
    internshipType: row.internshipType,
    startDate: placementRecord.startDate,
    endDate: placementRecord.endDate,
    workMode: row.workMode ?? null,
    durationWeeks: row.durationWeeks ?? null,
  }

  const renderAgreementPdf = async (code: string) => {
    const verificationUrl = `${env.NEXT_PUBLIC_BETTER_AUTH_URL}/${locale}/verify/${code}`
    const qrCodeDataUrl = await generateQRCodeDataUrl(verificationUrl)

    return renderToBuffer(
      createElement(ConventionDeStageTemplate, {
        data,
        locale,
        verificationCode: code,
        qrCodeDataUrl,
      }) as unknown as Parameters<typeof renderToBuffer>[0],
    )
  }

  let pdfBuffer = await renderAgreementPdf(verificationCode)

  const nextMeta = {
    generatedAt: new Date().toISOString(),
    locale,
    fileName: `agreement_${placementId}.pdf`,
    applicationId: row.applicationId,
    studentUniversityId: row.studentUniversityId,
  }

  let documentRecord = existingDoc
  let shouldSendAgreementEmail = false

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
        type: "agreement",
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
      shouldSendAgreementEmail = true
    } else {
      const [resolvedDoc] = await db
        .select()
        .from(placementDocument)
        .where(
          and(
            eq(placementDocument.placementId, placementId),
            eq(placementDocument.type, "agreement"),
          ),
        )
        .limit(1)

      if (!resolvedDoc) {
        throw new DocumentServiceError(
          "DOCUMENT_CONFLICT_RESOLUTION_FAILED",
          "Failed to resolve generated agreement document",
        )
      }

      documentRecord = resolvedDoc
      const resolvedVerificationCode =
        resolvedDoc.verificationCode ?? verificationCode

      if (resolvedVerificationCode !== verificationCode) {
        verificationCode = resolvedVerificationCode
        pdfBuffer = await renderAgreementPdf(verificationCode)
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
      "Failed to resolve generated agreement document",
    )
  }

  if (shouldSendAgreementEmail) {
    await createNotification({
      userId: row.studentUserId,
      type: "agreement_generated",
      payload: {
        placementId,
        documentId: documentRecord.id,
        companyName: row.companyName,
        offerTitle: row.offerTitle,
      },
    })

    void sendAgreementEmail({
      userId: row.studentUserId,
      to: row.studentEmail,
      studentName: row.studentName ?? "Student",
      companyName: row.companyName,
      offerTitle: row.offerTitle,
      internshipType: row.internshipType,
      startDate: placementRecord.startDate,
      endDate: placementRecord.endDate,
      verificationCode,
      locale,
    }).catch((error) => {
      logger.error(
        {
          err: error,
          event: "agreement_email_failed",
          placementId,
          studentEmail: row.studentEmail,
        },
        "Failed to send agreement generated email",
      )
    })
  }

  return {
    success: true,
    documentId: documentRecord.id,
    buffer: Buffer.from(pdfBuffer),
  }
}
