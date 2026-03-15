import "server-only"

import { headers } from "next/headers"

import type { EffectiveUserRole } from "@/lib/effective-role"
import { deriveEffectiveUserRole } from "@/lib/effective-role"
import { localeRedirect } from "@/lib/navigation"
import {
  approvalDeniedReasonToRedirectPath,
  checkAdminApproval,
} from "@/server/auth/approval-gate"

type UserRole = EffectiveUserRole
interface RequireRoleOptions {
  allowUnapproved?: boolean
}

interface SessionUser {
  id: string
  role: string
  name: string | null
  email: string
  banned?: boolean
  onboardingCompleted?: boolean | null
  universityId?: string | null
  departmentId?: string | null
  [key: string]: unknown
}

interface UniversityMembershipSummary {
  role: "department_head"
  departmentId: string | null
  universityId: string
}

type SessionResult = { user: SessionUser } | null

interface RequireRoleDependencies {
  getHeaders: typeof headers
  getSession: (input: {
    headers: Awaited<ReturnType<typeof headers>>
  }) => Promise<SessionResult | null>
  localeRedirect: (path: string) => Promise<never>
  getCompanyStatusByUserId: (
    userId: string,
  ) => Promise<{ status: string } | null>
  getUniversityStatusByUserId: (
    userId: string,
  ) => Promise<{ status: string } | null>
  getUniversityMembership: (
    userId: string,
  ) => Promise<UniversityMembershipSummary | null>
}

const DEFAULT_REQUIRE_ROLE_DEPENDENCIES: RequireRoleDependencies = {
  getHeaders: headers,
  getSession: async ({ headers: requestHeaders }) => {
    const { auth } = await import("@/lib/auth")
    return auth.api.getSession({
      headers: requestHeaders,
    }) as Promise<SessionResult | null>
  },
  localeRedirect,
  getCompanyStatusByUserId: async (userId) => {
    const { getCompanyStatusByUserId } = await import(
      "@/server/services/companies/get-status"
    )
    return getCompanyStatusByUserId(userId)
  },
  getUniversityStatusByUserId: async (userId) => {
    const { getUniversityStatusByUserId } = await import(
      "@/server/services/universities/get-status"
    )
    return getUniversityStatusByUserId(userId)
  },
  getUniversityMembership: async (userId) => {
    const { getUniversityMembership } = await import(
      "@/server/services/universities/membership"
    )
    return getUniversityMembership(userId)
  },
}

function buildLegacyMembership(
  user: SessionUser,
): UniversityMembershipSummary | null {
  if (user.role !== "dept_head" || !user.universityId) {
    return null
  }

  return {
    role: "department_head",
    departmentId: user.departmentId ?? null,
    universityId: user.universityId,
  }
}

async function resolveSessionUser(
  user: SessionUser,
  dependencies: RequireRoleDependencies,
) {
  const rawRole = user.role
  const membership =
    rawRole === "university_admin"
      ? await dependencies.getUniversityMembership(user.id)
      : buildLegacyMembership(user)

  const effectiveRole =
    deriveEffectiveUserRole({
      userRole: rawRole,
      universityMembershipRole: membership?.role ?? null,
    }) ?? "student"

  return {
    ...user,
    role: effectiveRole,
    effectiveRole,
    rawRole,
    universityId: membership?.universityId ?? user.universityId ?? null,
    departmentId: membership?.departmentId ?? user.departmentId ?? null,
    universityMembershipRole: membership?.role ?? null,
    universityDepartmentId: membership?.departmentId ?? user.departmentId ?? null,
  }
}

/**
 * Server-side role guard for layout.tsx files.
 * Checks the session and redirects to login (or home) if unauthorized.
 * Returns the session user on success.
 */
export async function requireRole(
  allowedRoles: UserRole[],
  options: RequireRoleOptions = {},
  dependencies: Partial<RequireRoleDependencies> = {},
) {
  const resolvedDependencies = {
    ...DEFAULT_REQUIRE_ROLE_DEPENDENCIES,
    ...dependencies,
  }

  const session = await resolvedDependencies.getSession({
    headers: await resolvedDependencies.getHeaders(),
  })

  if (!session) {
    return resolvedDependencies.localeRedirect("/login")
  }

  const derivedUser = await resolveSessionUser(session.user, resolvedDependencies)

  if (derivedUser.banned) {
    return resolvedDependencies.localeRedirect("/")
  }

  if (!allowedRoles.includes(derivedUser.role as UserRole)) {
    return resolvedDependencies.localeRedirect("/")
  }

  if (!options.allowUnapproved) {
    const approval = await checkAdminApproval(
      {
        ...derivedUser,
        role:
          derivedUser.rawRole === "dept_head"
            ? "university_admin"
            : derivedUser.rawRole,
      },
      {
        getCompanyStatusByUserId: resolvedDependencies.getCompanyStatusByUserId,
        getUniversityStatusByUserId:
          resolvedDependencies.getUniversityStatusByUserId,
      },
    )

    if (!approval.ok) {
      return resolvedDependencies.localeRedirect(
        approvalDeniedReasonToRedirectPath(approval.reason),
      )
    }
  }

  return derivedUser
}
