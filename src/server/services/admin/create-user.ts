import "server-only"

import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import type { PrimaryUserRole } from "@/lib/effective-role"
import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { companyMember } from "@/server/db/schema/companies"
import { universityMember } from "@/server/db/schema/university-memberships"
import { ServiceError } from "@/server/services/errors"

type CreateUserRole = PrimaryUserRole | "recruiter" | "department_head"

interface CreateUserData {
  email: string
  password: string
  name: string
  role: CreateUserRole
  universityId?: string
  companyId?: string
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

function resolvePrimaryRole(role: CreateUserRole): PrimaryUserRole {
  if (role === "recruiter") return "company_admin"
  if (role === "department_head") return "university_admin"
  return role
}

export async function createUser(
  data: CreateUserData,
  deps: CreateUserDeps = {},
) {
  const api = deps.authApi ?? getAuthApi()
  const getHeaders = deps.getHeaders ?? headers
  const primaryRole = resolvePrimaryRole(data.role)

  const result = await api.createUser({
    headers: await getHeaders(),
    body: {
      email: data.email,
      password: data.password,
      name: data.name,
      role: primaryRole,
      data: {
        emailVerified: true,
      },
    },
  })

  const createdUserId = extractUserId(result)
  if (!createdUserId) {
    return result
  }

  try {
    if (data.role === "student" && data.universityId) {
      await db
        .update(user)
        .set({ universityId: data.universityId })
        .where(eq(user.id, createdUserId))
    }

    if (data.role === "department_head" && data.universityId) {
      await db.transaction(async (tx) => {
        await tx.insert(universityMember).values({
          userId: createdUserId,
          universityId: data.universityId!,
          role: "department_head",
        })
        await tx
          .update(user)
          .set({ onboardingCompleted: true })
          .where(eq(user.id, createdUserId))
      })
    }

    if (data.role === "recruiter" && data.companyId) {
      await db.transaction(async (tx) => {
        await tx.insert(companyMember).values({
          companyId: data.companyId!,
          userId: createdUserId,
          role: "recruiter",
        })
        await tx
          .update(user)
          .set({ onboardingCompleted: true })
          .where(eq(user.id, createdUserId))
      })
    }
  } catch (error) {
    const constraint =
      typeof error === "object" && error !== null && "constraint" in error
        ? (error as { constraint?: string }).constraint
        : undefined

    if (
      constraint === "company_member_userId_uidx" ||
      constraint === "company_member_pkey"
    ) {
      throw new ServiceError(
        "COMPANY_MEMBER_ALREADY_ASSIGNED",
        "User is already assigned to another company",
      )
    }

    throw error
  }

  return result
}
