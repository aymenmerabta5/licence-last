import "server-only"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function listUserSessions(userId: string) {
  const result = await auth.api.listUserSessions({
    headers: await headers(),
    body: { userId },
  })

  return result
}

export async function revokeSession(sessionToken: string) {
  const result = await auth.api.revokeUserSession({
    headers: await headers(),
    body: { sessionToken },
  })

  return result
}

export async function revokeAllSessions(userId: string) {
  const result = await auth.api.revokeUserSessions({
    headers: await headers(),
    body: { userId },
  })

  return result
}
