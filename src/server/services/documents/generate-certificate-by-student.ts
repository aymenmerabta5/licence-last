import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { placement } from "@/server/db/schema/placements"
import { DocumentServiceError } from "@/server/services/documents/errors"

interface GenerateCertificateByStudentInput {
  placementId: string
  studentUserId: string
  locale?: string
  borderStyle?: string
}

export async function generateCertificateByStudent(
  input: GenerateCertificateByStudentInput,
): Promise<{
  success: boolean
  documentId: string
  buffer?: Buffer
}> {
  const [placementRow] = await db
    .select({
      placementId: placement.id,
      studentUserId: application.studentUserId,
      endDate: placement.endDate,
      applicationStatus: application.status,
    })
    .from(placement)
    .innerJoin(application, eq(placement.applicationId, application.id))
    .where(eq(placement.id, input.placementId))
    .limit(1)

  if (!placementRow) {
    throw new DocumentServiceError("PLACEMENT_NOT_FOUND", "Placement not found")
  }

  if (placementRow.studentUserId !== input.studentUserId) {
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
    placementId: input.placementId,
    locale: input.locale,
    borderStyle: input.borderStyle,
  })

  return result
}
