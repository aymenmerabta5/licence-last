import "server-only"

import { headers } from "next/headers"

import { localeRedirect } from "@/lib/navigation"
import { auth } from "@/lib/auth"
import { getCompanyByUserId } from "@/server/services/companies/get"
import { getUniversityByUserId } from "@/server/services/universities/get"

type UserRole = "student" | "company_admin" | "dept_head" | "university_admin" | "super_admin"
interface RequireRoleOptions {
  allowUnapproved?: boolean
}

/**
 * Server-side role guard for layout.tsx files.
 * Checks the session and redirects to login (or home) if unauthorized.
 * Returns the session user on success.
 */
export async function requireRole(
  allowedRoles: UserRole[],
  options: RequireRoleOptions = {},
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return localeRedirect("/login")
  }

  const { user } = session

  if (!allowedRoles.includes(user.role as UserRole)) {
    return localeRedirect("/")
  }

  if (!options.allowUnapproved && user.onboardingCompleted) {
    if (user.role === "company_admin") {
      const company = await getCompanyByUserId(user.id)
      if (!company || company.status === "pending" || company.status === "suspended") {
        return localeRedirect("/status/company/pending")
      }
      if (company.status === "rejected") {
        return localeRedirect("/status/company/rejected")
      }
    }

    if (user.role === "university_admin") {
      const university = await getUniversityByUserId(user.id)
      if (!university || university.status === "pending") {
        return localeRedirect("/status/university/pending")
      }
      if (university.status === "rejected") {
        return localeRedirect("/status/university/rejected")
      }
    }
  }

  return user
}
