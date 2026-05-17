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
import type { BorderStyleKey } from "@/server/pdfs/borders"
import {
  type CertificateData,
  InternshipCertificateTemplate,
} from "@/server/pdfs/CertificateTemplate"
import { DocumentServiceError } from "@/server/services/documents/errors"
import { persistDocumentBuffer } from "@/server/services/documents/persist"
import { generateQRCodeDataUrl } from "@/server/services/documents/qr-utils"
import { generateVerificationCode } from "@/server/services/documents/verification-code"

export interface GenerateCertificateInput {
  placementId: string
  locale?: string
  borderStyle?: string
}

export interface GenerateCertificateResult {
  success: boolean
  documentId: string
  buffer?: Buffer
}

interface CertificateContext {
  placementRecord: typeof placement.$inferSelect
  app: {
    applicationId: string
    offerTitle: string
    offerInternshipType: string
    companyName: string
    companyLogoUrl: string | null
    studentName: string | null
    studentEmail: string
    studentUniversityId: string | null
  }
  data: CertificateData
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

async function deleteStorageKeyIfExists(key: string | null): Promise<void> {
  if (!key) return
  const { deleteFile } = await import("@/server/storage/s3")
  try {
    await deleteFile(key)
  } catch {
    /* ignore */
  }
}

function toCertificateSnapshot(value: unknown): CertificateData | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>
  const studentName = pickString(record.studentName)
  const studentEmail = pickString(record.studentEmail)
  const companyName = pickString(record.companyName)
  const companyLogoUrl = pickString(record.companyLogoUrl)
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
    universityName: pickString(record.universityName),
    companyName,
    companyLogoUrl: companyLogoUrl ?? undefined,
    offerTitle,
    internshipType,
    startDate,
    endDate,
  }
}

async function loadCertificateContext(
  placementId: string,
): Promise<CertificateContext> {
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
      companyLogoUrl: company.logoUrl,
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

  return {
    placementRecord,
    app,
    data: {
      studentName: app.studentName ?? "Unknown",
      studentEmail: app.studentEmail,
      universityName: uniName,
      companyName: app.companyName,
      companyLogoUrl: app.companyLogoUrl ?? undefined,
      offerTitle: app.offerTitle,
      internshipType: app.offerInternshipType,
      startDate: placementRecord.startDate,
      endDate: placementRecord.endDate,
    },
  }
}

async function renderCertificateBuffer(params: {
  data: CertificateData
  locale: string
  borderStyle: string
  verificationCode: string
}): Promise<Buffer> {
  const verificationUrl = `${env.NEXT_PUBLIC_BETTER_AUTH_URL}/${params.locale}/verify/${params.verificationCode}`
  const qrCodeDataUrl = await generateQRCodeDataUrl(verificationUrl)

  const pdfBuffer = await renderToBuffer(
    createElement(InternshipCertificateTemplate, {
      data: params.data,
      locale: params.locale,
      borderStyle: params.borderStyle as BorderStyleKey,
      verificationCode: params.verificationCode,
      qrCodeDataUrl,
    }) as unknown as Parameters<typeof renderToBuffer>[0],
  )

  return Buffer.from(pdfBuffer)
}

export async function renderCertificatePdfBuffer(input: {
  placementId: string
  locale: string
  borderStyle: string
  verificationCode: string
  snapshotData?: unknown
}): Promise<Buffer> {
  const snapshot = toCertificateSnapshot(input.snapshotData)
  if (snapshot) {
    return renderCertificateBuffer({
      data: snapshot,
      locale: input.locale,
      borderStyle: input.borderStyle,
      verificationCode: input.verificationCode,
    })
  }

  const context = await loadCertificateContext(input.placementId)
  return renderCertificateBuffer({
    data: context.data,
    locale: input.locale,
    borderStyle: input.borderStyle,
    verificationCode: input.verificationCode,
  })
}

export async function generateCertificate(
  input: GenerateCertificateInput,
): Promise<GenerateCertificateResult> {
  const { placementId, locale = "en", borderStyle = "classic" } = input
  const context = await loadCertificateContext(placementId)

  if (context.placementRecord.endDate > new Date()) {
    throw new DocumentServiceError(
      "INTERNSHIP_NOT_COMPLETED",
      "Certificate can only be generated after the internship end date",
    )
  }

  const [existingDoc] = await db
    .select()
    .from(placementDocument)
    .where(
      and(
        eq(placementDocument.placementId, placementId),
        eq(placementDocument.type, "certificate"),
        eq(placementDocument.locale, locale),
        eq(placementDocument.borderStyle, borderStyle),
      ),
    )
    .limit(1)

  const existingMeta = toMetaRecord(existingDoc?.meta)
  const existingVerificationCode = pickString(existingDoc?.verificationCode)
  const existingLocale = pickString(existingMeta.locale)
  const existingFileName = pickString(existingMeta.fileName)
  const existingGeneratedAt = pickString(existingMeta.generatedAt)
  const existingSnapshot = toCertificateSnapshot(existingDoc?.snapshotData)

  if (existingDoc?.status === "generated" && existingVerificationCode) {
    const { fetchDocumentBuffer } = await import(
      "@/server/services/documents/persist"
    )
    let buffer: Buffer | null = null
    if (existingDoc.storageKey) {
      buffer = await fetchDocumentBuffer(existingDoc.storageKey)
    }
    if (!buffer) {
      await deleteStorageKeyIfExists(existingDoc.storageKey)
      buffer = await renderCertificateBuffer({
        data: existingSnapshot ?? context.data,
        locale: existingLocale ?? locale,
        borderStyle,
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
    borderStyle,
    fileName: existingFileName ?? `certificate_${placementId}.pdf`,
  }

  let pdfBuffer = await renderCertificateBuffer({
    data: context.data,
    locale: issuedLocale,
    borderStyle,
    verificationCode,
  })

  const snapshotData = context.data
  const storageKeyValue = `documents/certificate_${placementId}_${Date.now()}.pdf`
  const persistedKey = await persistDocumentBuffer(storageKeyValue, pdfBuffer)

  let documentRecord = existingDoc

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
  } else {
    const [insertedDoc] = await db
      .insert(placementDocument)
      .values({
        id: crypto.randomUUID(),
        placementId,
        type: "certificate",
        locale: issuedLocale,
        borderStyle,
        status: "generated",
        verificationCode,
        storageKey: persistedKey,
        snapshotData,
        meta: issuedMeta,
      })
      .onConflictDoNothing({
        target: [
          placementDocument.placementId,
          placementDocument.type,
          placementDocument.locale,
          placementDocument.borderStyle,
        ],
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
            eq(placementDocument.locale, locale),
            eq(placementDocument.borderStyle, borderStyle),
          ),
        )
        .limit(1)

      if (!resolvedDoc) {
        throw new DocumentServiceError(
          "DOCUMENT_CONFLICT_RESOLUTION_FAILED",
          "Failed to resolve generated certificate document",
        )
      }

      const resolvedMeta = toMetaRecord(resolvedDoc.meta)
      const resolvedVerificationCode =
        pickString(resolvedDoc.verificationCode) ?? verificationCode
      const resolvedSnapshot = toCertificateSnapshot(resolvedDoc.snapshotData)

      if (resolvedDoc.status === "generated" && resolvedVerificationCode) {
        return {
          success: true,
          documentId: resolvedDoc.id,
          buffer: await renderCertificateBuffer({
            data: resolvedSnapshot ?? context.data,
            locale: pickString(resolvedMeta.locale) ?? issuedLocale,
            borderStyle,
            verificationCode: resolvedVerificationCode,
          }),
        }
      }

      documentRecord = resolvedDoc
      verificationCode = resolvedVerificationCode
      pdfBuffer = await renderCertificateBuffer({
        data: context.data,
        locale: pickString(resolvedMeta.locale) ?? issuedLocale,
        borderStyle,
        verificationCode,
      })

      const resolvedPersistedKey = await persistDocumentBuffer(
        `documents/certificate_${placementId}_${Date.now()}.pdf`,
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
            borderStyle: pickString(resolvedMeta.borderStyle) ?? borderStyle,
            fileName: pickString(resolvedMeta.fileName) ?? issuedMeta.fileName,
          },
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
    buffer: pdfBuffer,
  }
}
