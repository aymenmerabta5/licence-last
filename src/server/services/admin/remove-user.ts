import "server-only"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"

const getAuthApi = () => (globalThis as any).__authApi ?? auth.api
type RemoveUserDeps = { authApi?: typeof auth.api; getHeaders?: typeof headers }

export async function removeUser(userId: string, deps: RemoveUserDeps = {}) {
  const api = deps.authApi ?? getAuthApi()
  const getHeaders = deps.getHeaders ?? headers
  const result = await api.removeUser({
    headers: await getHeaders(),
    body: { userId },
  })

  return result
}
