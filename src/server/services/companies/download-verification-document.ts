import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { company } from "@/server/db/schema/companies"
import { ServiceError } from "@/server/services/errors"
import { getFile } from "@/server/storage/s3"

interface DownloadCompanyVerificationDocumentResult {
  buffer: Buffer
  fileName: string
  mimeType: string
}

export async function downloadCompanyVerificationDocument(
  companyId: string,
): Promise<DownloadCompanyVerificationDocumentResult> {
  const [row] = await db
    .select({
      verificationDocumentKey: company.verificationDocumentKey,
      verificationDocumentName: company.verificationDocumentName,
      verificationDocumentMimeType: company.verificationDocumentMimeType,
    })
    .from(company)
    .where(eq(company.id, companyId))
    .limit(1)

  if (!row) {
    throw new ServiceError("COMPANY_NOT_FOUND", "Company not found")
  }

  if (
    !row.verificationDocumentKey ||
    !row.verificationDocumentName ||
    !row.verificationDocumentMimeType
  ) {
    throw new ServiceError(
      "COMPANY_VERIFICATION_DOCUMENT_NOT_FOUND",
      "Company verification document not found",
    )
  }

  const buffer = await getFile(row.verificationDocumentKey)

  return {
    buffer,
    fileName: row.verificationDocumentName,
    mimeType: row.verificationDocumentMimeType,
  }
}
