"use server"

import { randomUUID } from "node:crypto"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { uploadFile } from "@/server/storage/s3"

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
])

const MAX_SIZE = 2 * 1024 * 1024 // 2MB

const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

// Magic bytes for each allowed image type
const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF header
}

/** Validate file content matches declared MIME type via magic bytes. */
function validateMagicBytes(buffer: Buffer, declaredType: string): boolean {
  const signatures = MAGIC_BYTES[declaredType]
  if (!signatures) return false

  return signatures.some((sig) =>
    sig.every((byte, i) => buffer[i] === byte),
  )
}

/** Sanitize folder to prevent path traversal. Only allow alphanumeric, hyphens, underscores. */
function sanitizeFolder(folder: string): string {
  const sanitized = folder.replace(/[^a-zA-Z0-9_-]/g, "")
  return sanitized || "uploads"
}

export async function uploadFileAction(
  formData: FormData,
): Promise<{ url: string; key: string } | { error: string }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return { error: "Unauthorized" }
  }

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return { error: "No file provided" }
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "Invalid file type. Allowed: JPEG, PNG, WebP" }
  }

  if (file.size > MAX_SIZE) {
    return { error: "File too large. Maximum size is 2MB" }
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  // Validate actual file content matches declared MIME type
  if (!validateMagicBytes(buffer, file.type)) {
    return { error: "File content does not match declared type" }
  }

  const folder = formData.get("folder")
  const folderStr = sanitizeFolder(typeof folder === "string" ? folder : "uploads")
  const ext = EXT_MAP[file.type] ?? "bin"
  const key = `${folderStr}/${randomUUID()}.${ext}`

  try {
    const url = await uploadFile(key, buffer, file.type)
    return { url, key }
  } catch {
    return { error: "Upload failed. Please try again." }
  }
}
