import "server-only"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"

type RequestHeaders = Awaited<ReturnType<typeof headers>>

interface SessionAuthApi {
  listUserSessions(input: {
    headers: RequestHeaders
    body: {
      userId: string
    }
  }): Promise<unknown>
  revokeUserSession(input: {
    headers: RequestHeaders
    body: {
      sessionToken: string
    }
  }): Promise<unknown>
  revokeUserSessions(input: {
    headers: RequestHeaders
    body: {
      userId: string
    }
  }): Promise<unknown>
}

type AuthApiGlobal = typeof globalThis & { __authApi?: SessionAuthApi }

const getAuthApi = () => (globalThis as AuthApiGlobal).__authApi ?? auth.api
type SessionDeps = { authApi?: SessionAuthApi; getHeaders?: typeof headers }

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
