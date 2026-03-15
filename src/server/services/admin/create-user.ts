import "server-only"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import type { PrimaryUserRole } from "@/lib/effective-role"

interface CreateUserData {
  email: string
  password: string
  name: string
  role: PrimaryUserRole
}

type RequestHeaders = Awaited<ReturnType<typeof headers>>

interface CreateUserAuthApi {
  createUser(input: {
    headers: RequestHeaders
    body: {
      email: string
      password: string
      name: string
      role: CreateUserData["role"]
      data: {
        emailVerified: boolean
      }
    }
  }): Promise<unknown>
}

type AuthApiGlobal = typeof globalThis & { __authApi?: CreateUserAuthApi }

const getAuthApi = () => (globalThis as AuthApiGlobal).__authApi ?? auth.api
type CreateUserDeps = {
  authApi?: CreateUserAuthApi
  getHeaders?: typeof headers
}

export async function createUser(
  data: CreateUserData,
  deps: CreateUserDeps = {},
) {
  const api = deps.authApi ?? getAuthApi()
  const getHeaders = deps.getHeaders ?? headers
  const result = await api.createUser({
    headers: await getHeaders(),
    body: {
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role,
      data: {
        emailVerified: true,
      },
    },
  })

  return result
}
