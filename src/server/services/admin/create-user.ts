import "server-only"

import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import type { PrimaryUserRole } from "@/lib/effective-role"
import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"

interface CreateUserData {
  email: string
  password: string
  name: string
  role: PrimaryUserRole
  universityId?: string
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

function extractUserId(result: unknown): string | undefined {
  if (
    result &&
    typeof result === "object" &&
    "user" in result &&
    result.user &&
    typeof result.user === "object" &&
    "id" in result.user &&
    typeof result.user.id === "string"
  ) {
    return result.user.id
  }
  return undefined
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

  const createdUserId = extractUserId(result)
  if (createdUserId && data.universityId) {
    await db
      .update(user)
      .set({ universityId: data.universityId })
      .where(eq(user.id, createdUserId))
  }

  return result
}
