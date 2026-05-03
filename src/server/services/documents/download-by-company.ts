import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { internshipOffer } from "@/server/db/schema/internships"
import { placement, placementDocument } from "@/server/db/schema/placements"
import { DocumentServiceError } from "@/server/services/documents/errors"

interface DownloadDocumentByCompanyInput {
  documentId: string
  companyId: string
  locale?: string
}

interface DownloadDocumentByCompanyResult {
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

export async function downloadDocumentByCompany(
  input: DownloadDocumentByCompanyInput,
): Promise<DownloadDocumentByCompanyResult> {
  const [row] = await db
    .select({
      documentType: placementDocument.type,
      placementId: placement.id,
      status: placementDocument.status,
      locale: placementDocument.locale,
      borderStyle: placementDocument.borderStyle,
      meta: placementDocument.meta,
      verificationCode: placementDocument.verificationCode,
      storageKey: placementDocument.storageKey,
      snapshotData: placementDocument.snapshotData,
      companyId: internshipOffer.companyId,
    })
    .from(placementDocument)
    .innerJoin(placement, eq(placementDocument.placementId, placement.id))
    .innerJoin(application, eq(placement.applicationId, application.id))
    .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
    .where(eq(placementDocument.id, input.documentId))
    .limit(1)

  if (!row) {
    throw new DocumentServiceError("DOCUMENT_NOT_FOUND", "Document not found")
  }

  if (row.companyId !== input.companyId) {
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
  const borderStyle = pickString(meta.borderStyle) ?? row.borderStyle ?? "classic"
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
        borderStyle,
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
