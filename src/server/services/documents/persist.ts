import "server-only"

import { createModuleLogger } from "@/server/logging"
import * as s3 from "@/server/storage/s3"

const log = createModuleLogger("documents/persist")

export async function persistDocumentBuffer(
  key: string,
  buffer: Buffer,
): Promise<string | null> {
  if (!s3.isConfigured()) {
    log.warn({ key }, "S3 not configured — skipping document persistence")
    return null
  }

  try {
    await s3.uploadFile(key, buffer, "application/pdf")
    return key
  } catch (err) {
    log.error({ err, key }, "Failed to persist document to S3")
    return null
  }
}

export async function fetchDocumentBuffer(
  key: string,
): Promise<Buffer | null> {
  if (!s3.isConfigured()) {
    return null
  }

  try {
    return await s3.getFile(key)
  } catch (err) {
    log.warn({ err, key }, "Failed to fetch document from S3 — will regenerate")
    return null
  }
}
