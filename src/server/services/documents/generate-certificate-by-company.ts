import "server-only"

import { and, eq } from "drizzle-orm"

import { createNotification } from "@/server/services/notifications/create"
import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { company } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"
import { placement, placementDocument } from "@/server/db/schema/placements"
import { user } from "@/server/db/schema/auth"
import { generateCertificate } from "@/server/services/documents/generate-certificate"
import { sendCertificateEmail } from "@/server/services/documents/send-certificate-email"
import { logger } from "@/server/logging"

interface GenerateCertificateByCompanyInput {
  placementId: string
  companyId: string
  issuedByUserId: string
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

export async function generateCertificateByCompany(
  input: GenerateCertificateByCompanyInput,
): Promise<GenerateCertificateByCompanyResult> {
  const { placementId, companyId, issuedByUserId, locale } = input

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
    throw new Error("Placement not found")
  }

  if (placementRow.companyId !== companyId) {
    throw new Error("You do not have access to this placement")
  }

  if (placementRow.applicationStatus !== "admin_validated") {
    throw new Error("Only validated placements can receive certificates")
  }

  const result = await generateCertificate({
    placementId: placementRow.placementId,
    locale,
  })

  if (!result.buffer) {
    throw new Error("Failed to generate certificate")
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
    throw new Error("Certificate document not found")
  }

  await db
    .update(placementDocument)
    .set({
      meta: {
        ...toMetaRecord(doc.meta),
        issuedByUserId,
        issuedByRole: "company_admin",
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

  return {
    success: true,
    documentId: doc.id,
    fileName: `certificate_${placementRow.placementId}.pdf`,
    buffer: result.buffer,
  }
}
