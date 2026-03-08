import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { placement, placementDocument } from "@/server/db/schema/placements"
import { DocumentServiceError } from "@/server/services/documents/errors"

interface DownloadDocumentInput {
  documentId: string
  studentUserId: string
  locale?: string
}

interface DownloadDocumentResult {
  buffer: Buffer
  fileName: string
  documentType: "agreement" | "certificate"
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

export async function downloadDocument(
  input: DownloadDocumentInput,
): Promise<DownloadDocumentResult> {
  const [row] = await db
    .select({
      documentType: placementDocument.type,
      placementId: placement.id,
      status: placementDocument.status,
      meta: placementDocument.meta,
      verificationCode: placementDocument.verificationCode,
      storageKey: placementDocument.storageKey,
      snapshotData: placementDocument.snapshotData,
      studentUserId: application.studentUserId,
    })
    .from(placementDocument)
    .innerJoin(placement, eq(placementDocument.placementId, placement.id))
    .innerJoin(application, eq(placement.applicationId, application.id))
    .where(eq(placementDocument.id, input.documentId))
    .limit(1)

  if (!row) {
    throw new DocumentServiceError("DOCUMENT_NOT_FOUND", "Document not found")
  }

  if (row.studentUserId !== input.studentUserId) {
    throw new DocumentServiceError(
      "DOCUMENT_FORBIDDEN",
      "You do not have access to this document",
    )
  }

  if (row.status !== "generated") {
    throw new DocumentServiceError(
      "DOCUMENT_NOT_READY",
      "Document is not ready for download",
    )
  }

  const meta = toMetaRecord(row.meta)
  const locale = pickString(meta.locale) ?? input.locale ?? "en"
  const fileName =
    pickString(meta.fileName) ?? `${row.documentType}_${row.placementId}.pdf`
  const verificationCode = pickString(row.verificationCode)

  if (!verificationCode) {
    throw new DocumentServiceError(
      "DOCUMENT_GENERATION_FAILED",
      "Document verification is unavailable",
    )
  }

  if (row.storageKey) {
    const { fetchDocumentBuffer } = await import(
      "@/server/services/documents/persist"
    )
    const stored = await fetchDocumentBuffer(row.storageKey)
    if (stored) {
      return {
        buffer: stored,
        fileName,
        documentType: row.documentType as "agreement" | "certificate",
      }
    }
  }

  if (row.documentType === "agreement") {
    const { renderAgreementPdfBuffer } = await import(
      "@/server/services/documents/generate-agreement"
    )

    return {
      buffer: await renderAgreementPdfBuffer({
        placementId: row.placementId,
        locale,
        verificationCode,
        snapshotData: row.snapshotData,
      }),
      fileName,
      documentType: "agreement",
    }
  }

  if (row.documentType === "certificate") {
    const { renderCertificatePdfBuffer } = await import(
      "@/server/services/documents/generate-certificate"
    )

    return {
      buffer: await renderCertificatePdfBuffer({
        placementId: row.placementId,
        locale,
        verificationCode,
        snapshotData: row.snapshotData,
      }),
      fileName,
      documentType: "certificate",
    }
  }

  throw new DocumentServiceError(
    "DOCUMENT_UNSUPPORTED_TYPE",
    "Unsupported document type",
  )
}
