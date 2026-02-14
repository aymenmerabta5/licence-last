import "server-only"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"

/**
 * List all sessions for the authenticated user.
 * Returns a flat array of sessions.
 */
export async function listMySessions(userId: string) {
  const result = await auth.api.listUserSessions({
    headers: await headers(),
    body: { userId },
  })
  return result.sessions
}

/**
 * Revoke a single session belonging to the authenticated user.
 * Verifies ownership before revoking to prevent token-guessing.
 */
export async function revokeMySession(sessionToken: string, userId: string) {
  const hdrs = await headers()

  // Verify the session belongs to this user
  const { sessions } = await auth.api.listUserSessions({
    headers: hdrs,
    body: { userId },
  })

  const ownsSession = sessions.some((s) => s.token === sessionToken)
  if (!ownsSession) {
    throw new Error("Session not found or does not belong to you")
  }

  return auth.api.revokeUserSession({
    headers: hdrs,
    body: { sessionToken },
  })
}

/**
 * Revoke all sessions except the current one.
 * Returns the count of revoked sessions.
 */
export async function revokeOtherSessions(
  userId: string,
  currentSessionToken: string,
) {
  const hdrs = await headers()

  const { sessions } = await auth.api.listUserSessions({
    headers: hdrs,
    body: { userId },
  })

  const otherSessions = sessions.filter((s) => s.token !== currentSessionToken)

  if (otherSessions.length === 0) {
    return { revoked: 0 }
  }

  await Promise.all(
    otherSessions.map((s) =>
      auth.api.revokeUserSession({
        headers: hdrs,
        body: { sessionToken: s.token },
      }),
    ),
  )

  return { revoked: otherSessions.length }
}
