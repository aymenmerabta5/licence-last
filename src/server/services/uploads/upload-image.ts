import "server-only"

import { randomUUID } from "node:crypto"

import { uploadFile } from "@/server/storage/s3"

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
const MAX_SIZE = 2 * 1024 * 1024 // 2MB

const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

function matchesBytes(buffer: Buffer, offset: number, bytes: number[]): boolean {
  if (buffer.length < offset + bytes.length) return false
  for (let i = 0; i < bytes.length; i += 1) {
    if (buffer[offset + i] !== bytes[i]) return false
  }
  return true
}

/** Validate file content matches declared MIME type via magic bytes. */
function validateMagicBytes(buffer: Buffer, declaredType: string): boolean {
  if (declaredType === "image/jpeg") {
    return matchesBytes(buffer, 0, [0xff, 0xd8, 0xff])
  }

  if (declaredType === "image/png") {
    // 89 50 4E 47 0D 0A 1A 0A
    return matchesBytes(buffer, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  }

  if (declaredType === "image/webp") {
    // RIFF....WEBP
    return (
      matchesBytes(buffer, 0, [0x52, 0x49, 0x46, 0x46]) &&
      matchesBytes(buffer, 8, [0x57, 0x45, 0x42, 0x50])
    )
  }

  return false
}

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
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Invalid file type. Allowed: JPEG, PNG, WebP")
  }

  if (file.size > MAX_SIZE) {
    throw new Error("File too large. Maximum size is 2MB")
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  if (!validateMagicBytes(buffer, file.type)) {
    throw new Error("File content does not match declared type")
  }

  const folderStr = sanitizeFolder(folder)
  const ext = EXT_MAP[file.type] ?? "bin"
  const key = `${folderStr}/${randomUUID()}.${ext}`
  const url = await uploadFile(key, buffer, file.type)

  return { url, key }
}
