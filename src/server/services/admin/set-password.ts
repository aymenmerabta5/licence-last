import "server-only"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"

type RequestHeaders = Awaited<ReturnType<typeof headers>>

interface SetPasswordAuthApi {
  setUserPassword(input: {
    headers: RequestHeaders
    body: {
      userId: string
      newPassword: string
    }
  }): Promise<unknown>
}

type AuthApiGlobal = typeof globalThis & { __authApi?: SetPasswordAuthApi }

const getAuthApi = () => (globalThis as AuthApiGlobal).__authApi ?? auth.api
type SetPasswordDeps = {
  authApi?: SetPasswordAuthApi
  getHeaders?: typeof headers
}

export async function setUserPassword(
  userId: string,
  newPassword: string,
  deps: SetPasswordDeps = {},
) {
  const api = deps.authApi ?? getAuthApi()
  const getHeaders = deps.getHeaders ?? headers
  const result = await api.setUserPassword({
    headers: await getHeaders(),
    body: { userId, newPassword },
  })

  return result
}
