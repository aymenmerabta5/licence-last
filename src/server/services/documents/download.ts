import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { placement, placementDocument } from "@/server/db/schema/placements"
import { DocumentServiceError } from "@/server/services/documents/errors"
import { generateAgreement } from "@/server/services/documents/generate-agreement"
import { generateCertificate } from "@/server/services/documents/generate-certificate"

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

export async function downloadDocument(
  input: DownloadDocumentInput,
): Promise<DownloadDocumentResult> {
  const [row] = await db
    .select({
      documentType: placementDocument.type,
      placementId: placement.id,
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

  if (row.documentType === "agreement") {
    const result = await generateAgreement({
      placementId: row.placementId,
      locale: input.locale,
    })

    if (!result.buffer) {
      throw new DocumentServiceError(
        "DOCUMENT_GENERATION_FAILED",
        "Failed to generate agreement",
      )
    }

    return {
      buffer: result.buffer,
      fileName: `agreement_${row.placementId}.pdf`,
      documentType: "agreement",
    }
  }

  if (row.documentType === "certificate") {
    const result = await generateCertificate({
      placementId: row.placementId,
      locale: input.locale,
    })

    if (!result.buffer) {
      throw new DocumentServiceError(
        "DOCUMENT_GENERATION_FAILED",
        "Failed to generate certificate",
      )
    }

    return {
      buffer: result.buffer,
      fileName: `certificate_${row.placementId}.pdf`,
      documentType: "certificate",
    }
  }

  throw new DocumentServiceError(
    "DOCUMENT_UNSUPPORTED_TYPE",
    "Unsupported document type",
  )
}
