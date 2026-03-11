import "server-only"

import { and, eq } from "drizzle-orm"
import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { user } from "@/server/db/schema/auth"
import { company } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"
import { placement, placementDocument } from "@/server/db/schema/placements"
import { logger } from "@/server/logging"
import { DocumentServiceError } from "@/server/services/documents/errors"
import { sendCertificateEmail } from "@/server/services/documents/send-certificate-email"
import { createNotification } from "@/server/services/notifications/create"

interface GenerateCertificateByCompanyInput {
  placementId: string
  companyId: string
  issuedByUserId: string
  issuedByMembershipRole: string
  locale?: string
}

interface GenerateCertificateByCompanyResult {
  success: boolean
  documentId: string
  fileName: string
  buffer?: Buffer
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

export async function generateCertificateByCompany(
  input: GenerateCertificateByCompanyInput,
): Promise<GenerateCertificateByCompanyResult> {
  const {
    placementId,
    companyId,
    issuedByUserId,
    issuedByMembershipRole,
    locale,
  } = input

  if (issuedByMembershipRole !== "owner") {
    throw new DocumentServiceError(
      "PLACEMENT_FORBIDDEN",
      "You do not have access to this placement",
    )
  }

  const [placementRow] = await db
    .select({
      placementId: placement.id,
      startDate: placement.startDate,
      endDate: placement.endDate,
      applicationStatus: application.status,
      offerTitle: internshipOffer.title,
      internshipType: internshipOffer.internshipType,
      companyId: internshipOffer.companyId,
      companyName: company.name,
      studentUserId: application.studentUserId,
      studentName: user.name,
      studentEmail: user.email,
    })
    .from(placement)
    .innerJoin(application, eq(placement.applicationId, application.id))
    .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
    .innerJoin(company, eq(internshipOffer.companyId, company.id))
    .innerJoin(user, eq(application.studentUserId, user.id))
    .where(eq(placement.id, placementId))
    .limit(1)

  if (!placementRow) {
    throw new DocumentServiceError("PLACEMENT_NOT_FOUND", "Placement not found")
  }

  if (placementRow.companyId !== companyId) {
    throw new DocumentServiceError(
      "PLACEMENT_FORBIDDEN",
      "You do not have access to this placement",
    )
  }

  if (placementRow.applicationStatus !== "admin_validated") {
    throw new DocumentServiceError(
      "PLACEMENT_NOT_VALIDATED",
      "Only validated placements can receive certificates",
    )
  }

  if (placementRow.endDate > new Date()) {
    throw new DocumentServiceError(
      "INTERNSHIP_NOT_COMPLETED",
      "Certificate can only be generated after the internship end date",
    )
  }

  const { generateCertificate } = await import(
    "@/server/services/documents/generate-certificate"
  )

  const result = await generateCertificate({
    placementId: placementRow.placementId,
    locale,
  })

  if (!result.buffer) {
    throw new DocumentServiceError(
      "DOCUMENT_GENERATION_FAILED",
      "Failed to generate certificate",
    )
  }

  const [doc] = await db
    .select({
      id: placementDocument.id,
      verificationCode: placementDocument.verificationCode,
      meta: placementDocument.meta,
    })
    .from(placementDocument)
    .where(
      and(
        eq(placementDocument.id, result.documentId),
        eq(placementDocument.placementId, placementId),
      ),
    )
    .limit(1)

  if (!doc) {
    throw new DocumentServiceError(
      "DOCUMENT_RECORD_NOT_FOUND",
      "Certificate document not found",
    )
  }

  const meta = toMetaRecord(doc.meta)
  const hasImmutableIssuer =
    pickString(meta.issuedAt) != null &&
    pickString(meta.issuedByUserId) != null &&
    pickString(meta.issuedByRole) != null

  if (!hasImmutableIssuer) {
    await db
      .update(placementDocument)
      .set({
        meta: {
          ...meta,
          issuedByUserId,
          issuedByRole: "company_admin",
          issuedByMembershipRole,
          issuedAt: new Date().toISOString(),
        },
      })
      .where(eq(placementDocument.id, doc.id))

    await createNotification({
      userId: placementRow.studentUserId,
      type: "certificate_generated",
      payload: {
        placementId: placementRow.placementId,
        documentId: doc.id,
        companyName: placementRow.companyName,
        offerTitle: placementRow.offerTitle,
      },
    })

    if (doc.verificationCode) {
      void sendCertificateEmail({
        userId: placementRow.studentUserId,
        to: placementRow.studentEmail,
        studentName: placementRow.studentName ?? "Student",
        companyName: placementRow.companyName,
        offerTitle: placementRow.offerTitle,
        internshipType: placementRow.internshipType,
        startDate: placementRow.startDate,
        endDate: placementRow.endDate,
        verificationCode: doc.verificationCode,
        locale,
      }).catch((error) => {
        logger.error(
          {
            err: error,
            event: "certificate_email_failed",
            placementId,
            studentEmail: placementRow.studentEmail,
          },
          "Failed to send certificate generated email",
        )
      })
    }
  }

  return {
    success: true,
    documentId: doc.id,
    fileName:
      pickString(meta.fileName) ??
      `certificate_${placementRow.placementId}.pdf`,
    buffer: result.buffer,
  }
}
