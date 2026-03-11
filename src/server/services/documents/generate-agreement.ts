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
import { persistDocumentBuffer } from "@/server/services/documents/persist"
import { generateQRCodeDataUrl } from "@/server/services/documents/qr-utils"
import { sendAgreementEmail } from "@/server/services/documents/send-agreement-email"
import { generateVerificationCode } from "@/server/services/documents/verification-code"
import { createNotification } from "@/server/services/notifications/create"

export interface AgreementIssuerContext {
  userId: string
  role: string | null
  universityId: string | null
  departmentId: string | null
}

export interface GenerateAgreementInput {
  placementId: string
  locale?: string
  issuer: AgreementIssuerContext
}

export interface GenerateAgreementResult {
  success: boolean
  documentId: string
  buffer?: Buffer
}

interface AgreementContext {
  placementRecord: typeof placement.$inferSelect
  row: {
    applicationId: string
    offerTitle: string
    internshipType: string
    workMode: string | null
    durationWeeks: number | null
    companyName: string
    companyAddress: string | null
    companyPhone: string | null
    companyRepresentativeName: string | null
    companyContactEmail: string | null
    studentName: string | null
    studentEmail: string
    studentUserId: string
    studentUniversityId: string | null
    studentDepartmentId: string | null
    studentPhone: string | null
    studentNumber: string | null
    studentDepartment: string | null
    studentAddress: string | null
    universityName: string | null
    universityDepartmentName: string | null
    universityAddress: string | null
    universityPhone: string | null
  }
  data: AgreementData
}

function toMetaRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }

  return {}
}

function pickString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null
}

function pickNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function pickDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value
  }

  if (typeof value === "string") {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }

  return null
}

function toAgreementSnapshot(value: unknown): AgreementData | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>
  const studentName = pickString(record.studentName)
  const studentEmail = pickString(record.studentEmail)
  const companyName = pickString(record.companyName)
  const offerTitle = pickString(record.offerTitle)
  const internshipType = pickString(record.internshipType)
  const startDate = pickDate(record.startDate)
  const endDate = pickDate(record.endDate)

  if (
    !studentName ||
    !studentEmail ||
    !companyName ||
    !offerTitle ||
    !internshipType ||
    !startDate ||
    !endDate
  ) {
    return null
  }

  return {
    studentName,
    studentEmail,
    studentPhone: pickString(record.studentPhone),
    studentNumber: pickString(record.studentNumber),
    studentDepartment: pickString(record.studentDepartment),
    studentAddress: pickString(record.studentAddress),
    companyName,
    companyAddress: pickString(record.companyAddress),
    companyPhone: pickString(record.companyPhone),
    companyRepresentativeName: pickString(record.companyRepresentativeName),
    companyContactEmail: pickString(record.companyContactEmail),
    universityName: pickString(record.universityName),
    universityDepartmentName: pickString(record.universityDepartmentName),
    universityAddress: pickString(record.universityAddress),
    universityPhone: pickString(record.universityPhone),
    offerTitle,
    internshipType,
    startDate,
    endDate,
    workMode: pickString(record.workMode),
    durationWeeks: pickNumber(record.durationWeeks),
  }
}

function canIssueAgreement(
  issuer: AgreementIssuerContext,
  studentUniversityId: string | null,
  studentDepartmentId: string | null,
): boolean {
  if (issuer.role === "university_admin") {
    return (
      issuer.universityId != null && issuer.universityId === studentUniversityId
    )
  }

  if (issuer.role === "dept_head") {
    return (
      issuer.universityId != null &&
      issuer.departmentId != null &&
      issuer.universityId === studentUniversityId &&
      issuer.departmentId === studentDepartmentId
    )
  }

  return false
}

async function loadAgreementContext(
  placementId: string,
): Promise<AgreementContext> {
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
      studentDepartmentId: studentProfile.departmentId,
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

  return {
    placementRecord,
    row,
    data: {
      studentName: row.studentName ?? "Unknown",
      studentEmail: row.studentEmail,
      studentPhone: row.studentPhone ?? null,
      studentNumber: row.studentNumber ?? null,
      studentDepartment: row.studentDepartment ?? null,
      studentAddress: row.studentAddress ?? null,
      companyName: row.companyName,
      companyAddress: row.companyAddress ?? null,
      companyPhone: row.companyPhone ?? null,
      companyRepresentativeName: row.companyRepresentativeName ?? null,
      companyContactEmail: row.companyContactEmail ?? null,
      universityName: row.universityName ?? null,
      universityDepartmentName: row.universityDepartmentName ?? null,
      universityAddress: row.universityAddress ?? null,
      universityPhone: row.universityPhone ?? null,
      offerTitle: row.offerTitle,
      internshipType: row.internshipType,
      startDate: placementRecord.startDate,
      endDate: placementRecord.endDate,
      workMode: row.workMode ?? null,
      durationWeeks: row.durationWeeks ?? null,
    },
  }
}

async function renderAgreementBuffer(params: {
  data: AgreementData
  locale: string
  verificationCode: string
}): Promise<Buffer> {
  const verificationUrl = `${env.NEXT_PUBLIC_BETTER_AUTH_URL}/${params.locale}/verify/${params.verificationCode}`
  const qrCodeDataUrl = await generateQRCodeDataUrl(verificationUrl)

  const pdfBuffer = await renderToBuffer(
    createElement(ConventionDeStageTemplate, {
      data: params.data,
      locale: params.locale,
      verificationCode: params.verificationCode,
      qrCodeDataUrl,
    }) as unknown as Parameters<typeof renderToBuffer>[0],
  )

  return Buffer.from(pdfBuffer)
}

export async function renderAgreementPdfBuffer(input: {
  placementId: string
  locale: string
  verificationCode: string
  snapshotData?: unknown
}): Promise<Buffer> {
  const snapshot = toAgreementSnapshot(input.snapshotData)
  if (snapshot) {
    return renderAgreementBuffer({
      data: snapshot,
      locale: input.locale,
      verificationCode: input.verificationCode,
    })
  }

  const context = await loadAgreementContext(input.placementId)
  return renderAgreementBuffer({
    data: context.data,
    locale: input.locale,
    verificationCode: input.verificationCode,
  })
}

export async function generateAgreement(
  input: GenerateAgreementInput,
): Promise<GenerateAgreementResult> {
  const { placementId, locale = "en", issuer } = input
  const context = await loadAgreementContext(placementId)

  if (
    !canIssueAgreement(
      issuer,
      context.row.studentUniversityId,
      context.row.studentDepartmentId,
    )
  ) {
    throw new DocumentServiceError(
      "PLACEMENT_FORBIDDEN",
      "You do not have access to this placement",
    )
  }

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

  const existingMeta = toMetaRecord(existingDoc?.meta)
  const existingVerificationCode = pickString(existingDoc?.verificationCode)
  const existingLocale = pickString(existingMeta.locale)
  const existingFileName = pickString(existingMeta.fileName)
  const existingGeneratedAt = pickString(existingMeta.generatedAt)
  const existingIssuedByUserId = pickString(existingMeta.issuedByUserId)
  const existingIssuedByRole = pickString(existingMeta.issuedByRole)
  const existingSnapshot = toAgreementSnapshot(existingDoc?.snapshotData)

  if (existingDoc?.status === "generated" && existingVerificationCode) {
    const { fetchDocumentBuffer } = await import(
      "@/server/services/documents/persist"
    )
    let buffer: Buffer | null = null
    if (existingDoc.storageKey) {
      buffer = await fetchDocumentBuffer(existingDoc.storageKey)
    }
    if (!buffer) {
      buffer = await renderAgreementBuffer({
        data: existingSnapshot ?? context.data,
        locale: existingLocale ?? locale,
        verificationCode: existingVerificationCode,
      })
    }
    return {
      success: true,
      documentId: existingDoc.id,
      buffer,
    }
  }

  let verificationCode = existingVerificationCode ?? generateVerificationCode()
  const issuedLocale = existingLocale ?? locale
  const issuedMeta = {
    ...existingMeta,
    generatedAt: existingGeneratedAt ?? new Date().toISOString(),
    locale: issuedLocale,
    fileName: existingFileName ?? `agreement_${placementId}.pdf`,
    applicationId: context.row.applicationId,
    studentUniversityId: context.row.studentUniversityId,
    issuedByUserId: existingIssuedByUserId ?? issuer.userId,
    issuedByRole: existingIssuedByRole ?? issuer.role,
  }

  let pdfBuffer = await renderAgreementBuffer({
    data: context.data,
    locale: issuedLocale,
    verificationCode,
  })

  const snapshotData = context.data
  const storageKeyValue = `documents/agreement_${placementId}_${Date.now()}.pdf`
  const persistedKey = await persistDocumentBuffer(storageKeyValue, pdfBuffer)

  let documentRecord = existingDoc
  let shouldSendAgreementEmail = false

  if (documentRecord) {
    await db
      .update(placementDocument)
      .set({
        status: "generated",
        verificationCode,
        storageKey: persistedKey,
        snapshotData,
        meta: issuedMeta,
      })
      .where(eq(placementDocument.id, documentRecord.id))
    shouldSendAgreementEmail = documentRecord.status !== "generated"
  } else {
    const [insertedDoc] = await db
      .insert(placementDocument)
      .values({
        id: crypto.randomUUID(),
        placementId,
        type: "agreement",
        status: "generated",
        verificationCode,
        storageKey: persistedKey,
        snapshotData,
        meta: issuedMeta,
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

      const resolvedMeta = toMetaRecord(resolvedDoc.meta)
      const resolvedVerificationCode =
        pickString(resolvedDoc.verificationCode) ?? verificationCode
      const resolvedSnapshot = toAgreementSnapshot(resolvedDoc.snapshotData)

      if (resolvedDoc.status === "generated" && resolvedVerificationCode) {
        return {
          success: true,
          documentId: resolvedDoc.id,
          buffer: await renderAgreementBuffer({
            data: resolvedSnapshot ?? context.data,
            locale: pickString(resolvedMeta.locale) ?? issuedLocale,
            verificationCode: resolvedVerificationCode,
          }),
        }
      }

      documentRecord = resolvedDoc
      verificationCode = resolvedVerificationCode
      pdfBuffer = await renderAgreementBuffer({
        data: context.data,
        locale: pickString(resolvedMeta.locale) ?? issuedLocale,
        verificationCode,
      })

      const resolvedPersistedKey = await persistDocumentBuffer(
        `documents/agreement_${placementId}_${Date.now()}.pdf`,
        pdfBuffer,
      )

      await db
        .update(placementDocument)
        .set({
          status: "generated",
          verificationCode,
          storageKey: resolvedPersistedKey,
          snapshotData,
          meta: {
            ...resolvedMeta,
            generatedAt:
              pickString(resolvedMeta.generatedAt) ?? issuedMeta.generatedAt,
            locale: pickString(resolvedMeta.locale) ?? issuedMeta.locale,
            fileName: pickString(resolvedMeta.fileName) ?? issuedMeta.fileName,
            applicationId: context.row.applicationId,
            studentUniversityId: context.row.studentUniversityId,
            issuedByUserId:
              pickString(resolvedMeta.issuedByUserId) ??
              issuedMeta.issuedByUserId,
            issuedByRole:
              pickString(resolvedMeta.issuedByRole) ?? issuedMeta.issuedByRole,
          },
        })
        .where(eq(placementDocument.id, documentRecord.id))
      shouldSendAgreementEmail = true
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
      userId: context.row.studentUserId,
      type: "agreement_generated",
      payload: {
        placementId,
        documentId: documentRecord.id,
        companyName: context.row.companyName,
        offerTitle: context.row.offerTitle,
      },
    })

    void sendAgreementEmail({
      userId: context.row.studentUserId,
      to: context.row.studentEmail,
      studentName: context.row.studentName ?? "Student",
      companyName: context.row.companyName,
      offerTitle: context.row.offerTitle,
      internshipType: context.row.internshipType,
      startDate: context.placementRecord.startDate,
      endDate: context.placementRecord.endDate,
      verificationCode,
      locale: issuedLocale,
    }).catch((error) => {
      logger.error(
        {
          err: error,
          event: "agreement_email_failed",
          placementId,
          studentEmail: context.row.studentEmail,
        },
        "Failed to send agreement generated email",
      )
    })
  }

  return {
    success: true,
    documentId: documentRecord.id,
    buffer: pdfBuffer,
  }
}
