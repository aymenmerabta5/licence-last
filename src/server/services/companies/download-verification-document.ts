import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { company } from "@/server/db/schema/companies"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"
import { getFile, isConfigured } from "@/server/storage/s3"

const log = createModuleLogger("companies/download-verification-document")

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

  if (!isConfigured()) {
    throw new ServiceError(
      "STORAGE_UNAVAILABLE",
      "File storage is not configured",
    )
  }

  let buffer: Buffer
  try {
    buffer = await getFile(row.verificationDocumentKey)
  } catch (err) {
    log.error(
      { err, key: row.verificationDocumentKey, companyId },
      "Failed to download verification document from S3",
    )
    throw new ServiceError(
      "STORAGE_UNAVAILABLE",
      "File storage is temporarily unavailable",
      { cause: err },
    )
  }

  return {
    buffer,
    fileName: row.verificationDocumentName,
    mimeType: row.verificationDocumentMimeType,
  }
}
