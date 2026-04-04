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
interface AdminSessionRecord {
  id: string
  token?: string
}

function normalizeAdminSessions(result: unknown): AdminSessionRecord[] {
  const rawSessions = Array.isArray(result)
    ? result
    : result &&
        typeof result === "object" &&
        Array.isArray((result as { sessions?: unknown[] }).sessions)
      ? (result as { sessions: unknown[] }).sessions
      : []

  return rawSessions.flatMap((session) => {
    if (!session || typeof session !== "object") {
      return []
    }

    const record = session as Record<string, unknown>
    const id = typeof record.id === "string" ? record.id : null
    if (!id) {
      return []
    }

    return [
      {
        id,
        token: typeof record.token === "string" ? record.token : undefined,
      },
    ]
  })
}

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

export async function revokeSession(
  userId: string,
  sessionId: string,
  deps: SessionDeps = {},
) {
  const api = deps.authApi ?? getAuthApi()
  const getHeaders = deps.getHeaders ?? headers
  const listedSessions = await listUserSessions(userId, deps)
  const session = normalizeAdminSessions(listedSessions).find(
    (entry) => entry.id === sessionId,
  )

  if (typeof session?.token !== "string" || session.token.length === 0) {
    return null
  }

  const result = await api.revokeUserSession({
    headers: await getHeaders(),
    body: { sessionToken: session.token },
  })

  return result
}

export async function revokeAllSessions(
  userId: string,
  deps: SessionDeps = {},
) {
  const api = deps.authApi ?? getAuthApi()
  const getHeaders = deps.getHeaders ?? headers
  const result = await api.revokeUserSessions({
    headers: await getHeaders(),
    body: { userId },
  })

  return result
}
