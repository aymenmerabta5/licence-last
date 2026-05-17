import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { company } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"
import { placement, placementDocument } from "@/server/db/schema/placements"
import { logger } from "@/server/logging"
import { DocumentServiceError } from "@/server/services/documents/errors"
import { createNotification } from "@/server/services/notifications/create"

interface RevokeCertificateInput {
  documentId: string
  companyId: string
  revokedByUserId: string
  revokedByMembershipRole: string
  reason: string
}

interface RevokeCertificateResult {
  success: boolean
  documentId: string
}

function toMetaRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }

  return {}
}

export async function revokeCertificate(
  input: RevokeCertificateInput,
): Promise<RevokeCertificateResult> {
  const {
    documentId,
    companyId,
    revokedByUserId,
    revokedByMembershipRole,
    reason,
  } = input

  if (revokedByMembershipRole !== "owner") {
    throw new DocumentServiceError(
      "DOCUMENT_FORBIDDEN",
      "Only company owners can revoke certificates",
    )
  }

  if (!reason || reason.trim().length === 0) {
    throw new Error("Revocation reason is required")
  }

  const [docRow] = await db
    .select({
      id: placementDocument.id,
      placementId: placementDocument.placementId,
      type: placementDocument.type,
      meta: placementDocument.meta,
    })
    .from(placementDocument)
    .where(eq(placementDocument.id, documentId))
    .limit(1)

  if (!docRow) {
    throw new DocumentServiceError(
      "DOCUMENT_NOT_FOUND",
      "Certificate document not found",
    )
  }

  if (docRow.type !== "certificate") {
    throw new DocumentServiceError(
      "DOCUMENT_UNSUPPORTED_TYPE",
      "Only certificates can be revoked",
    )
  }

  const [placementRow] = await db
    .select({
      placementId: placement.id,
      companyId: internshipOffer.companyId,
      studentUserId: application.studentUserId,
      companyName: company.name,
      offerTitle: internshipOffer.title,
    })
    .from(placement)
    .innerJoin(application, eq(placement.applicationId, application.id))
    .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
    .innerJoin(company, eq(internshipOffer.companyId, company.id))
    .where(eq(placement.id, docRow.placementId))
    .limit(1)

  if (!placementRow) {
    throw new DocumentServiceError(
      "PLACEMENT_NOT_FOUND",
      "Placement not found for this document",
    )
  }

  if (placementRow.companyId !== companyId) {
    throw new DocumentServiceError(
      "DOCUMENT_FORBIDDEN",
      "You do not have access to this document",
    )
  }

  const meta = toMetaRecord(docRow.meta)

  if (meta.revokedAt) {
    throw new DocumentServiceError(
      "DOCUMENT_CONFLICT_RESOLUTION_FAILED",
      "This certificate has already been revoked",
    )
  }

  const updatedMeta = {
    ...meta,
    revokedAt: new Date().toISOString(),
    revokedByUserId,
    revokedByMembershipRole,
    revocationReason: reason.trim(),
  }

  await db
    .update(placementDocument)
    .set({ meta: updatedMeta })
    .where(eq(placementDocument.id, documentId))

  try {
    await createNotification({
      userId: placementRow.studentUserId,
      type: "certificate_revoked",
      payload: {
        placementId: placementRow.placementId,
        documentId,
        companyName: placementRow.companyName,
        offerTitle: placementRow.offerTitle,
        reason: reason.trim(),
      },
    })
  } catch (error) {
    logger.error(
      {
        err: error,
        event: "certificate_revoke_notification_failed",
        placementId: placementRow.placementId,
        documentId,
        studentUserId: placementRow.studentUserId,
      },
      "Failed to create certificate revoked notification",
    )
  }

  return { success: true, documentId }
}
