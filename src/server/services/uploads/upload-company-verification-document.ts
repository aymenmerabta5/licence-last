import "server-only"

import { randomUUID } from "node:crypto"

import {
  COMPANY_VERIFICATION_DOCUMENT_ALLOWED_TYPES,
  COMPANY_VERIFICATION_DOCUMENT_EXTENSIONS,
  COMPANY_VERIFICATION_DOCUMENT_MAX_SIZE,
} from "@/lib/constants/uploads"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"
import { uploadFile } from "@/server/storage/s3"

const log = createModuleLogger(
  "services/uploads/upload-company-verification-document",
)

function matchesBytes(
  buffer: Buffer,
  offset: number,
  bytes: number[],
): boolean {
  if (buffer.length < offset + bytes.length) {
    return false
  }

  for (let index = 0; index < bytes.length; index += 1) {
    if (buffer[offset + index] !== bytes[index]) {
      return false
    }
  }

  return true
}

function validateMagicBytes(buffer: Buffer, declaredType: string): boolean {
  if (declaredType === "application/pdf") {
    return matchesBytes(buffer, 0, [0x25, 0x50, 0x44, 0x46])
  }

  if (declaredType === "image/jpeg") {
    return matchesBytes(buffer, 0, [0xff, 0xd8, 0xff])
  }

  if (declaredType === "image/png") {
    return matchesBytes(
      buffer,
      0,
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    )
  }

  return false
}

function sanitizeUserId(userId: string): string {
  return userId.replace(/[^a-zA-Z0-9_-]/g, "")
}

interface UploadCompanyVerificationDocumentInput {
  file: File
  userId: string
}

interface UploadCompanyVerificationDocumentResult {
  key: string
  fileName: string
  mimeType: string
  fileSizeBytes: number
}

export async function uploadCompanyVerificationDocument({
  file,
  userId,
}: UploadCompanyVerificationDocumentInput): Promise<UploadCompanyVerificationDocumentResult> {
  if (!COMPANY_VERIFICATION_DOCUMENT_ALLOWED_TYPES.has(file.type)) {
    throw new ServiceError(
      "INVALID_FILE_TYPE",
      "Verification document must be a PDF, JPEG, or PNG file",
    )
  }

  if (file.size > COMPANY_VERIFICATION_DOCUMENT_MAX_SIZE) {
    throw new ServiceError(
      "FILE_TOO_LARGE",
      "Verification document file size cannot exceed 10MB",
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  if (!validateMagicBytes(buffer, file.type)) {
    throw new ServiceError(
      "FILE_CONTENT_MISMATCH",
      "File content does not match declared document type",
    )
  }

  const extension = COMPANY_VERIFICATION_DOCUMENT_EXTENSIONS[file.type] ?? "bin"
  const safeUserId = sanitizeUserId(userId) || "company-admin"
  const key = `company-verification/${safeUserId}/${randomUUID()}.${extension}`

  log.info(
    { userId, key, mimeType: file.type, size: file.size },
    "Uploading company verification document",
  )

  await uploadFile(key, buffer, file.type)

  return {
    key,
    fileName: file.name,
    mimeType: file.type,
    fileSizeBytes: file.size,
  }
}
