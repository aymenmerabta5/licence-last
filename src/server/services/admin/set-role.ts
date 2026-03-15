import "server-only"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import type { PrimaryUserRole } from "@/lib/effective-role"

type UserRole = PrimaryUserRole

type RequestHeaders = Awaited<ReturnType<typeof headers>>

interface SetRoleAuthApi {
  setRole(input: {
    headers: RequestHeaders
    body: {
      userId: string
      role: UserRole
    }
  }): Promise<unknown>
}

type AuthApiGlobal = typeof globalThis & { __authApi?: SetRoleAuthApi }

const getAuthApi = () => (globalThis as AuthApiGlobal).__authApi ?? auth.api
type SetRoleDeps = { authApi?: SetRoleAuthApi; getHeaders?: typeof headers }

export async function setUserRole(
  userId: string,
  role: UserRole,
  deps: SetRoleDeps = {},
) {
  const api = deps.authApi ?? getAuthApi()
  const getHeaders = deps.getHeaders ?? headers
  const result = await api.setRole({
    headers: await getHeaders(),
    body: { userId, role },
  })

  return result
}
