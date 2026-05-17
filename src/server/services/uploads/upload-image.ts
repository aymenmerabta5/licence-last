import "server-only"

import { randomUUID } from "node:crypto"
import {
  ALLOWED_IMAGE_TYPES,
  IMAGE_EXT_MAP,
  MAX_IMAGE_SIZE,
  validateMagicBytes,
} from "@/lib/image-validation"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"
import { uploadFile } from "@/server/storage/s3"

const log = createModuleLogger("services/uploads/upload-image")

/** Sanitize folder to prevent path traversal. Only allow alphanumeric, hyphens, underscores. */
function sanitizeFolder(folder: string): string {
  const sanitized = folder.replace(/[^a-zA-Z0-9_-]/g, "")
  return sanitized || "uploads"
}

interface UploadImageParams {
  file: File
  folder?: string
}

export async function uploadImageToS3({
  file,
  folder = "uploads",
}: UploadImageParams): Promise<{ url: string; key: string }> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new ServiceError(
      "INVALID_FILE_TYPE",
      "Invalid file type. Allowed: JPEG, PNG, WebP",
    )
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new ServiceError(
      "FILE_TOO_LARGE",
      "File too large. Maximum size is 5MB",
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  if (!validateMagicBytes(buffer, file.type)) {
    throw new ServiceError(
      "FILE_CONTENT_MISMATCH",
      "File content does not match declared type",
    )
  }

  const folderStr = sanitizeFolder(folder)
  const ext = IMAGE_EXT_MAP[file.type] ?? "bin"
  const key = `${folderStr}/${randomUUID()}.${ext}`

  log.info({ key, type: file.type, size: file.size }, "Uploading image to S3")
  const url = await uploadFile(key, buffer, file.type)

  log.info({ key, event: "image_uploaded" }, "Image uploaded successfully")
  return { url, key }
}
