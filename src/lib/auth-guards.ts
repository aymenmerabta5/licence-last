import "server-only"

import { headers } from "next/headers"

import { localeRedirect } from "@/lib/navigation"

type UserRole = "student" | "company_admin" | "dept_head" | "university_admin" | "super_admin"
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
  getSession: (input: { headers: Awaited<ReturnType<typeof headers>> }) => Promise<SessionResult | null>
  localeRedirect: (path: string) => Promise<never>
  getCompanyByUserId: (userId: string) => Promise<{ status: string } | null>
  getUniversityByUserId: (userId: string) => Promise<{ status: string } | null>
}

const DEFAULT_REQUIRE_ROLE_DEPENDENCIES: RequireRoleDependencies = {
  getHeaders: headers,
  getSession: async ({ headers: requestHeaders }) => {
    const { auth } = await import("@/lib/auth")
    return auth.api.getSession({ headers: requestHeaders }) as Promise<SessionResult | null>
  },
  localeRedirect,
  getCompanyByUserId: async (userId) => {
    const { getCompanyByUserId } = await import("@/server/services/companies/get")
    return getCompanyByUserId(userId)
  },
  getUniversityByUserId: async (userId) => {
    const { getUniversityStatusByUserId } = await import("@/server/services/universities/get-status")
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
  const resolvedDependencies = { ...DEFAULT_REQUIRE_ROLE_DEPENDENCIES, ...dependencies }

  const session = await resolvedDependencies.getSession({
    headers: await resolvedDependencies.getHeaders(),
  })

  if (!session) {
    return resolvedDependencies.localeRedirect("/login")
  }

  const { user } = session

  if (!allowedRoles.includes(user.role as UserRole)) {
    return resolvedDependencies.localeRedirect("/")
  }

  if (!options.allowUnapproved && user.onboardingCompleted) {
    if (user.role === "company_admin") {
      const company = await resolvedDependencies.getCompanyByUserId(user.id)
      if (!company || company.status === "pending" || company.status === "suspended") {
        return resolvedDependencies.localeRedirect("/status/company/pending")
      }
      if (company.status === "rejected") {
        return resolvedDependencies.localeRedirect("/status/company/rejected")
      }
    }

    if (user.role === "university_admin") {
      const university = await resolvedDependencies.getUniversityByUserId(user.id)
      if (!university || university.status === "pending") {
        return resolvedDependencies.localeRedirect("/status/university/pending")
      }
      if (university.status === "rejected") {
        return resolvedDependencies.localeRedirect("/status/university/rejected")
      }
    }
  }

  return user
}
