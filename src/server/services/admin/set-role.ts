import "server-only"

import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import type { PrimaryUserRole } from "@/lib/effective-role"
import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { companyMember } from "@/server/db/schema/companies"
import { universityMember } from "@/server/db/schema/university-memberships"

type ChangeRole = PrimaryUserRole | "recruiter" | "department_head"

interface UpdateUserRoleData {
  role: ChangeRole
  universityId?: string
  companyId?: string
  departmentId?: string
}

type RequestHeaders = Awaited<ReturnType<typeof headers>>

interface SetRoleAuthApi {
  setRole(input: {
    headers: RequestHeaders
    body: { userId: string; role: PrimaryUserRole }
  }): Promise<unknown>
}

type AuthApiGlobal = typeof globalThis & { __authApi?: SetRoleAuthApi }

const getAuthApi = () => (globalThis as AuthApiGlobal).__authApi ?? auth.api

type UpdateUserRoleDeps = {
  authApi?: SetRoleAuthApi
  getHeaders?: typeof headers
}

function resolvePrimaryRole(role: ChangeRole): PrimaryUserRole {
  if (role === "recruiter") return "company_admin"
  if (role === "department_head") return "university_admin"
  return role
}

export async function updateUserRole(
  targetUserId: string,
  data: UpdateUserRoleData,
  deps: UpdateUserRoleDeps = {},
) {
  const api = deps.authApi ?? getAuthApi()
  const getHeaders = deps.getHeaders ?? headers
  const primaryRole = resolvePrimaryRole(data.role)

  // 1. Update auth role via better-auth
  await api.setRole({
    headers: await getHeaders(),
    body: { userId: targetUserId, role: primaryRole },
  })

  // 2. Sync database state based on new role
  const { role } = data

  if (role === "student") {
    await db
      .update(user)
      .set({
        universityId: data.universityId ?? null,
        departmentId: null,
        onboardingCompleted: false,
      })
      .where(eq(user.id, targetUserId))

    await db
      .delete(universityMember)
      .where(eq(universityMember.userId, targetUserId))
    await db
      .delete(companyMember)
      .where(eq(companyMember.userId, targetUserId))

    return { success: true }
  }

  if (role === "recruiter" && data.companyId) {
    await db
      .update(user)
      .set({
        universityId: null,
        departmentId: null,
        onboardingCompleted: true,
      })
      .where(eq(user.id, targetUserId))

    await db
      .delete(universityMember)
      .where(eq(universityMember.userId, targetUserId))
    await db
      .delete(companyMember)
      .where(eq(companyMember.userId, targetUserId))

    await db.insert(companyMember).values({
      companyId: data.companyId,
      userId: targetUserId,
      role: "recruiter",
    })

    return { success: true }
  }

  if (role === "department_head" && data.universityId) {
    await db
      .update(user)
      .set({
        universityId: data.universityId,
        departmentId: data.departmentId ?? null,
        onboardingCompleted: true,
      })
      .where(eq(user.id, targetUserId))

    await db
      .delete(companyMember)
      .where(eq(companyMember.userId, targetUserId))
    await db
      .delete(universityMember)
      .where(eq(universityMember.userId, targetUserId))

    await db.insert(universityMember).values({
      userId: targetUserId,
      universityId: data.universityId,
      role: "department_head",
      departmentId: data.departmentId ?? null,
    })

    return { success: true }
  }

  // company_admin, university_admin, super_admin
  await db
    .update(user)
    .set({
      universityId: null,
      departmentId: null,
      onboardingCompleted: false,
    })
    .where(eq(user.id, targetUserId))

  await db
    .delete(universityMember)
    .where(eq(universityMember.userId, targetUserId))
  await db
    .delete(companyMember)
    .where(eq(companyMember.userId, targetUserId))

  return { success: true }
}
