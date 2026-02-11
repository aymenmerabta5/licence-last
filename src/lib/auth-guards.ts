import "server-only"

import { headers } from "next/headers"

import { localeRedirect } from "@/lib/navigation"
import { auth } from "@/lib/auth"

type UserRole = "student" | "company_admin" | "admin" | "super_admin"

/**
 * Server-side role guard for layout.tsx files.
 * Checks the session and redirects to login (or home) if unauthorized.
 * Returns the session user on success.
 */
export async function requireRole(allowedRoles: UserRole[]) {
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

  return user
}
