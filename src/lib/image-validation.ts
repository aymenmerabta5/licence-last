export const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

export const MAX_IMAGE_SIZE = 2 * 1024 * 1024 // 2MB

export const IMAGE_EXT_MAP: Record<string, string> = {
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
export function validateMagicBytes(buffer: Buffer, declaredType: string): boolean {
  if (declaredType === "image/jpeg") {
    return matchesBytes(buffer, 0, [0xff, 0xd8, 0xff])
  }

  if (declaredType === "image/png") {
    // Full 8-byte PNG header: 89 50 4E 47 0D 0A 1A 0A
    return matchesBytes(buffer, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  }

  if (declaredType === "image/webp") {
    // RIFF....WEBP (check both RIFF header and WEBP marker)
    return (
      matchesBytes(buffer, 0, [0x52, 0x49, 0x46, 0x46]) &&
      matchesBytes(buffer, 8, [0x57, 0x45, 0x42, 0x50])
    )
  }

  return false
}
