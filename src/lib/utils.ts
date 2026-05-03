import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const INVALID_IPS = new Set(["", "::", "0.0.0.0"])
const ALL_ZERO_IPV6_RE = /^(?:0+:){7}0+$/

/**
 * Sanitize an IP address before sending to the client.
 * Returns null for empty, unspecified (:: / 0.0.0.0 / all-zero IPv6), or invalid values.
 */
export function sanitizeIpAddress(
  ip: string | null | undefined,
): string | null {
  if (!ip || typeof ip !== "string") return null
  const trimmed = ip.trim()
  if (trimmed.length === 0) return null
  const lower = trimmed.toLowerCase()
  if (INVALID_IPS.has(lower)) return null
  if (ALL_ZERO_IPV6_RE.test(lower)) return null
  return trimmed
}
