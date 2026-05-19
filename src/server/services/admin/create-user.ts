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

async function findCreatedUserIdByEmail(
  email: string,
): Promise<string | undefined> {
  const [row] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1)
  return row?.id
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

  let result: unknown
  try {
    result = await api.createUser({
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
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message.toLowerCase()
        : String(error).toLowerCase()

    if (
      message.includes("already exists") ||
      message.includes("email already")
    ) {
      throw new ServiceError(
        "EMAIL_ALREADY_EXISTS",
        "An account with this email already exists",
        { cause: error },
      )
    }

    throw error
  }

  // Prefer the ID from the API response, but fall back to a DB lookup
  // by email so that the activation update never gets skipped.
  const createdUserId =
    extractUserId(result) ?? (await findCreatedUserIdByEmail(data.email))

  if (!createdUserId) {
    throw new ServiceError(
      "USER_NOT_FOUND_AFTER_CREATION",
      "User was created but could not be located for activation",
    )
  }

  try {
    if (data.role === "student") {
      await db
        .update(user)
        .set({
          emailVerified: true,
          ...(data.universityId ? { universityId: data.universityId } : {}),
        })
        .where(eq(user.id, createdUserId))
    } else if (data.role === "department_head" && data.universityId) {
      await db.transaction(async (tx) => {
        await tx.insert(universityMember).values({
          userId: createdUserId,
          universityId: data.universityId!,
          role: "department_head",
        })
        await tx
          .update(user)
          .set({ emailVerified: true, onboardingCompleted: true })
          .where(eq(user.id, createdUserId))
      })
    } else if (data.role === "recruiter" && data.companyId) {
      await db.transaction(async (tx) => {
        await tx.insert(companyMember).values({
          companyId: data.companyId!,
          userId: createdUserId,
          role: "recruiter",
        })
        await tx
          .update(user)
          .set({ emailVerified: true, onboardingCompleted: true })
          .where(eq(user.id, createdUserId))
      })
    } else {
      await db
        .update(user)
        .set({ emailVerified: true, onboardingCompleted: true })
        .where(eq(user.id, createdUserId))
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
