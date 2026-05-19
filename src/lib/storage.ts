const BASE_URL = process.env.NEXT_PUBLIC_S3_URL?.replace(/\/+$/, "")

/**
 * Resolve an image/document URL for client-side rendering.
 * Absolute URLs are returned as-is. Relative paths are prefixed with
 * `NEXT_PUBLIC_S3_URL` so they work in browsers.
 */
export function resolvePublicUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  if (!BASE_URL) return url
  const cleanUrl = url.replace(/^\/+/, "")
  return `${BASE_URL}/${cleanUrl}`
}
