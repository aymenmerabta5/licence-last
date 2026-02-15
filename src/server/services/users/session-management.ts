import "server-only"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"

/**
 * List all sessions for the authenticated user.
 * Returns a flat array of sessions.
 */
export async function listMySessions() {
  return auth.api.listSessions({
    headers: await headers(),
  })
}

/**
 * Revoke a single session belonging to the authenticated user.
 * Verifies ownership before revoking to prevent token-guessing.
 */
export async function revokeMySession(sessionToken: string) {
  const hdrs = await headers()

  // Verify the session belongs to the current user
  const sessions = await auth.api.listSessions({
    headers: hdrs,
  })

  const ownsSession = sessions.some((s) => s.token === sessionToken)
  if (!ownsSession) {
    throw new Error("Session not found or does not belong to you")
  }

  return auth.api.revokeSession({
    headers: hdrs,
    body: { token: sessionToken },
  })
}

/**
 * Revoke all sessions except the current one.
 * Returns the count of revoked sessions.
 */
export async function revokeOtherSessions(currentSessionToken: string) {
  const hdrs = await headers()

  const sessions = await auth.api.listSessions({
    headers: hdrs,
  })

  const otherSessions = sessions.filter((s) => s.token !== currentSessionToken)

  if (otherSessions.length === 0) {
    return { revoked: 0 }
  }

  await auth.api.revokeOtherSessions({ headers: hdrs })

  return { revoked: otherSessions.length }
}
