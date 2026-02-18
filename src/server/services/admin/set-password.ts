import "server-only"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"

const getAuthApi = () => (globalThis as any).__authApi ?? auth.api
type SetPasswordDeps = { authApi?: typeof auth.api; getHeaders?: typeof headers }

export async function setUserPassword(userId: string, newPassword: string, deps: SetPasswordDeps = {}) {
  const api = deps.authApi ?? getAuthApi()
  const getHeaders = deps.getHeaders ?? headers
  const result = await api.setUserPassword({
    headers: await getHeaders(),
    body: { userId, newPassword },
  })

  return result
}
