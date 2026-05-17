import "server-only"

import { and, eq, notExists, sql } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { internshipOffer } from "@/server/db/schema/internships"
import { placement, placementDocument } from "@/server/db/schema/placements"
import { logger } from "@/server/logging"
import { DocumentServiceError } from "@/server/services/documents/errors"
import { generateCertificateByCompany } from "@/server/services/documents/generate-certificate-by-company"

interface GenerateMissingCertificatesInput {
  companyId: string
  issuedByUserId: string
  issuedByMembershipRole: string
  locale?: string
  borderStyle?: string
}

interface GenerateMissingCertificatesResult {
  generatedCount: number
  errors: Array<{ placementId: string; error: string }>
}

export async function generateMissingCertificates(
  input: GenerateMissingCertificatesInput,
): Promise<GenerateMissingCertificatesResult> {
  const {
    companyId,
    issuedByUserId,
    issuedByMembershipRole,
    locale,
    borderStyle,
  } = input

  if (issuedByMembershipRole !== "owner") {
    throw new DocumentServiceError(
      "PLACEMENT_FORBIDDEN",
      "Only company owners can generate certificates",
    )
  }

  const missingPlacements = await db
    .select({
      placementId: placement.id,
    })
    .from(placement)
    .innerJoin(application, eq(placement.applicationId, application.id))
    .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
    .where(
      and(
        eq(internshipOffer.companyId, companyId),
        eq(application.status, "admin_validated"),
        sql`${placement.endDate} <= ${new Date().toISOString()}`,
        notExists(
          db
            .select({ id: placementDocument.id })
            .from(placementDocument)
            .where(
              and(
                eq(placementDocument.placementId, placement.id),
                eq(placementDocument.type, "certificate"),
                eq(placementDocument.status, "generated"),
              ),
            ),
        ),
      ),
    )
    .orderBy(placement.validatedAt)

  const errors: Array<{ placementId: string; error: string }> = []
  let generatedCount = 0

  for (const row of missingPlacements) {
    try {
      await generateCertificateByCompany({
        placementId: row.placementId,
        companyId,
        issuedByUserId,
        issuedByMembershipRole,
        locale,
        borderStyle,
      })
      generatedCount++
    } catch (error) {
      const message =
        error instanceof DocumentServiceError
          ? error.message
          : "Failed to generate certificate"
      errors.push({ placementId: row.placementId, error: message })
      logger.error(
        {
          err: error,
          event: "generate_missing_certificate_failed",
          placementId: row.placementId,
          companyId,
        },
        "Failed to generate missing certificate",
      )
    }
  }

  return { generatedCount, errors }
}
