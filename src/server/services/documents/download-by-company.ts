import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { internshipOffer } from "@/server/db/schema/internships"
import { placement, placementDocument } from "@/server/db/schema/placements"
import { generateAgreement } from "@/server/services/documents/generate-agreement"
import { generateCertificate } from "@/server/services/documents/generate-certificate"

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

export async function downloadDocumentByCompany(
  input: DownloadDocumentByCompanyInput,
): Promise<DownloadDocumentByCompanyResult> {
  const [row] = await db
    .select({
      documentType: placementDocument.type,
      placementId: placement.id,
      companyId: internshipOffer.companyId,
    })
    .from(placementDocument)
    .innerJoin(placement, eq(placementDocument.placementId, placement.id))
    .innerJoin(application, eq(placement.applicationId, application.id))
    .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
    .where(eq(placementDocument.id, input.documentId))
    .limit(1)

  if (!row) {
    throw new Error("Document not found")
  }

  if (row.companyId !== input.companyId) {
    throw new Error("You do not have access to this document")
  }

  if (row.documentType === "agreement") {
    const result = await generateAgreement({
      placementId: row.placementId,
      locale: input.locale,
    })

    if (!result.buffer) {
      throw new Error("Failed to generate agreement")
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
      throw new Error("Failed to generate certificate")
    }

    return {
      buffer: result.buffer,
      fileName: `certificate_${row.placementId}.pdf`,
      documentType: "certificate",
    }
  }

  throw new Error("Unsupported document type")
}
