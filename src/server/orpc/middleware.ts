import "server-only"

import { os, ORPCError } from "@orpc/server"
import { headers } from "next/headers"
import { eq } from "drizzle-orm"

import { auth } from "@/lib/auth"
import { db } from "@/server/db"
import { companyMember } from "@/server/db/schema/companies"
import { studentProfile } from "@/server/db/schema/students"

/**
 * Check if a user role has admin privileges (admin or super_admin).
 */
export function isAdminRole(role: string | null | undefined): boolean {
  return role === "admin" || role === "super_admin"
}

/** Public — no auth required. */
export const publicProcedure = os

/** Authenticated — requires a valid session. */
export const authedProcedure = os.use(async ({ next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new ORPCError("UNAUTHORIZED")
  }

  return next({ context: { session: session.session, user: session.user } })
})

/** Admin — requires admin or super_admin role. */
export const adminProcedure = authedProcedure.use(
  async ({ context, next }) => {
    if (!isAdminRole(context.user.role)) {
      throw new ORPCError("FORBIDDEN", {
        message: "Admin access required",
      })
    }
    return next({ context })
  },
)

/** Super admin only. */
export const superAdminProcedure = authedProcedure.use(
  async ({ context, next }) => {
    if (context.user.role !== "super_admin") {
      throw new ORPCError("FORBIDDEN", {
        message: "Super admin access required",
      })
    }
    return next({ context })
  },
)

/** Company admin — injects company membership into context. */
export const companyAdminProcedure = authedProcedure.use(
  async ({ context, next }) => {
    if (context.user.role !== "company_admin") {
      throw new ORPCError("FORBIDDEN", {
        message: "Company admin access required",
      })
    }

    const [membership] = await db
      .select()
      .from(companyMember)
      .where(eq(companyMember.userId, context.user.id))
      .limit(1)

    if (!membership) {
      throw new ORPCError("FORBIDDEN", {
        message: "No company membership found",
      })
    }

    return next({ context: { ...context, companyMembership: membership } })
  },
)

/** Student — requires student role, injects student profile. */
export const studentProcedure = authedProcedure.use(
  async ({ context, next }) => {
    if (context.user.role !== "student") {
      throw new ORPCError("FORBIDDEN", {
        message: "Student access required",
      })
    }

    const [profile] = await db
      .select()
      .from(studentProfile)
      .where(eq(studentProfile.userId, context.user.id))
      .limit(1)

    return next({ context: { ...context, studentProfile: profile ?? null } })
  },
)
