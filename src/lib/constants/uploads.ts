export const COMPANY_VERIFICATION_DOCUMENT_ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
])

export const COMPANY_VERIFICATION_DOCUMENT_MAX_SIZE = 10 * 1024 * 1024 // 10MB

export const COMPANY_VERIFICATION_DOCUMENT_EXTENSIONS: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
}
