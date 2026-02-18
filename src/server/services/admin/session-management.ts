import "server-only"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"

const getAuthApi = () => (globalThis as any).__authApi ?? auth.api
type SessionDeps = { authApi?: typeof auth.api; getHeaders?: typeof headers }

export async function listUserSessions(userId: string, deps: SessionDeps = {}) {
  const api = deps.authApi ?? getAuthApi()
  const getHeaders = deps.getHeaders ?? headers
  const result = await api.listUserSessions({
    headers: await getHeaders(),
    body: { userId },
  })

  return result
}

export async function revokeSession(sessionToken: string, deps: SessionDeps = {}) {
  const api = deps.authApi ?? getAuthApi()
  const getHeaders = deps.getHeaders ?? headers
  const result = await api.revokeUserSession({
    headers: await getHeaders(),
    body: { sessionToken },
  })

  return result
}

export async function revokeAllSessions(userId: string, deps: SessionDeps = {}) {
  const api = deps.authApi ?? getAuthApi()
  const getHeaders = deps.getHeaders ?? headers
  const result = await api.revokeUserSessions({
    headers: await getHeaders(),
    body: { userId },
  })

  return result
}
