import "server-only"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { getLocale } from "next-intl/server"

import { auth } from "@/lib/auth"

type UserRole = "student" | "company_admin" | "admin" | "super_admin"

/**
 * Server-side role guard for layout.tsx files.
 * Checks the session and redirects to login (or home) if unauthorized.
 * Returns the session user on success.
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const locale = await getLocale()
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect(`/${locale}/login`)
  }

  const { user } = session

  if (!allowedRoles.includes(user.role as UserRole)) {
    redirect(`/${locale}`)
  }

  return user
}
