import "server-only"

import { env } from "@/env"

/**
 * Validate that the request Origin header matches the configured app origin.
 * GET/HEAD requests are allowed without origin (they don't mutate state).
 * State-changing requests (POST, PUT, DELETE) require a matching origin.
 */
export function isValidOrigin(request: Request): boolean {
  if (request.method === "GET" || request.method === "HEAD") return true

  const origin = request.headers.get("origin")
  if (!origin) return false

  return origin === new URL(env.NEXT_PUBLIC_BETTER_AUTH_URL).origin
}
