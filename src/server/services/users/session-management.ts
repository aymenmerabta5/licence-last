import "server-only"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"

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
 * Accepts session ID (not token) so that full tokens are never exposed to the client.
 */
export async function revokeMySession(sessionId: string) {
  const hdrs = await headers()

  // Verify the session belongs to the current user and resolve its token
  const sessions = await auth.api.listSessions({
    headers: hdrs,
  })

  const target = sessions.find((s) => s.id === sessionId)
  if (!target) {
    throw new Error("Session not found or does not belong to you")
  }

  return auth.api.revokeSession({
    headers: hdrs,
    body: { token: target.token },
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
