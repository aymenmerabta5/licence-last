import "server-only"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import type { PrimaryUserRole } from "@/lib/effective-role"

interface UpdateUserData {
  name?: string
  email?: string
  role?: PrimaryUserRole
}

type RequestHeaders = Awaited<ReturnType<typeof headers>>

interface UpdateUserAuthApi {
  adminUpdateUser(input: {
    headers: RequestHeaders
    body: {
      userId: string
      data: UpdateUserData
    }
  }): Promise<unknown>
}

type AuthApiGlobal = typeof globalThis & { __authApi?: UpdateUserAuthApi }

const getAuthApi = () => (globalThis as AuthApiGlobal).__authApi ?? auth.api
type UpdateUserDeps = {
  authApi?: UpdateUserAuthApi
  getHeaders?: typeof headers
}

export async function updateUser(
  userId: string,
  data: UpdateUserData,
  deps: UpdateUserDeps = {},
) {
  const api = deps.authApi ?? getAuthApi()
  const getHeaders = deps.getHeaders ?? headers
  const result = await api.adminUpdateUser({
    headers: await getHeaders(),
    body: { userId, data },
  })

  return result
}
