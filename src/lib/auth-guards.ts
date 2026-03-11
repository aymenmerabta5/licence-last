import "server-only"

import { headers } from "next/headers"

import { localeRedirect } from "@/lib/navigation"
import {
  approvalDeniedReasonToRedirectPath,
  checkAdminApproval,
} from "@/server/auth/approval-gate"

type UserRole =
  | "student"
  | "company_admin"
  | "dept_head"
  | "university_admin"
  | "super_admin"
interface RequireRoleOptions {
  allowUnapproved?: boolean
}

interface SessionUser {
  id: string
  role: string
  name: string | null
  email: string
  onboardingCompleted?: boolean | null
  [key: string]: unknown
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

  const { user } = session

  if (user.banned) {
    return resolvedDependencies.localeRedirect("/")
  }

  if (!allowedRoles.includes(user.role as UserRole)) {
    return resolvedDependencies.localeRedirect("/")
  }

  // Approval checks are onboarding-gated by design. Before onboarding
  // completion, company/university admins can access onboarding/status flows.
  if (!options.allowUnapproved) {
    const approval = await checkAdminApproval(user, {
      getCompanyStatusByUserId: resolvedDependencies.getCompanyStatusByUserId,
      getUniversityStatusByUserId:
        resolvedDependencies.getUniversityStatusByUserId,
    })

    if (!approval.ok) {
      return resolvedDependencies.localeRedirect(
        approvalDeniedReasonToRedirectPath(approval.reason),
      )
    }
  }

  return user
}
