import "server-only"

import { getPublicAppUrl } from "@/lib/public-url"

function getAllowedOrigins(): Set<string> {
  const origins = new Set<string>([new URL(getPublicAppUrl()).origin])
  const trustedOrigins = process.env.BETTER_AUTH_TRUSTED_ORIGINS

  if (!trustedOrigins) {
    return origins
  }

  for (const candidate of trustedOrigins.split(",")) {
    const value = candidate.trim()
    if (!value) {
      continue
    }

    try {
      origins.add(new URL(value).origin)
    } catch {
      // Ignore malformed trusted-origin entries instead of blocking valid ones.
    }
  }

  return origins
}

/**
 * Validate that the request Origin header matches the configured app origin.
 * GET/HEAD requests are allowed without origin (they don't mutate state).
 * State-changing requests (POST, PUT, DELETE) require a matching origin.
 */
export function isValidOrigin(request: Request): boolean {
  if (request.method === "GET" || request.method === "HEAD") return true

  const origin = request.headers.get("origin")
  if (!origin) return false

  return getAllowedOrigins().has(origin)
}
