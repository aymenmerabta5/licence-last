import "server-only"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"

type RequestHeaders = Awaited<ReturnType<typeof headers>>

interface RemoveUserAuthApi {
  removeUser(input: {
    headers: RequestHeaders
    body: {
      userId: string
    }
  }): Promise<unknown>
}

type AuthApiGlobal = typeof globalThis & { __authApi?: RemoveUserAuthApi }

const getAuthApi = () => (globalThis as AuthApiGlobal).__authApi ?? auth.api
type RemoveUserDeps = {
  authApi?: RemoveUserAuthApi
  getHeaders?: typeof headers
}

export async function removeUser(userId: string, deps: RemoveUserDeps = {}) {
  const api = deps.authApi ?? getAuthApi()
  const getHeaders = deps.getHeaders ?? headers
  const result = await api.removeUser({
    headers: await getHeaders(),
    body: { userId },
  })

  return result
}
