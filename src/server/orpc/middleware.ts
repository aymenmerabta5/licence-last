import "server-only"

import { os, ORPCError } from "@orpc/server"
import { headers } from "next/headers"
import { eq } from "drizzle-orm"

import { auth } from "@/lib/auth"
import { checkAdminApproval } from "@/server/auth/approval-gate"
import { db } from "@/server/db"
import { companyMember } from "@/server/db/schema/companies"
import { studentProfile } from "@/server/db/schema/students"
import { isServiceError } from "@/server/services/errors"

/**
 * Check if a user role has admin privileges (university_admin, dept_head, or super_admin).
 */
export function isAdminRole(role: string | null | undefined): boolean {
  return role === "university_admin" || role === "dept_head" || role === "super_admin"
}

/** Public — no auth required. */
export const publicProcedure = os

/** Authenticated session — requires a valid session. */
export const authedSessionProcedure = os.use(async ({ next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new ORPCError("UNAUTHORIZED")
  }

  if (session.user.banned) {
    throw new ORPCError("FORBIDDEN", { message: "Account suspended" })
  }

  return next({ context: { session: session.session, user: session.user } })
})

/** Enforce super-admin approval for onboarded company/university admins. */
async function assertApprovedAdminAccess(user: {
  id: string
  role?: string | null
  onboardingCompleted?: boolean | null
}) {
  try {
    const approval = await checkAdminApproval(user)

    if (approval.ok) {
      return
    }

    const message =
      approval.reason === "company_pending" || approval.reason === "company_rejected"
        ? "Company account is not approved by super admin yet"
        : "University account is not approved by super admin yet"

    throw new ORPCError("FORBIDDEN", { message })
  } catch (error) {
    if (isServiceError(error) && error.code === "COMPANY_MEMBERSHIP_CONFLICT") {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Multiple company memberships found for user",
      })
    }

    throw error
  }
}

/** Authenticated + approval gate for onboarded admin accounts. */
export const authedProcedure = authedSessionProcedure.use(
  async ({ context, next }) => {
    await assertApprovedAdminAccess(context.user)
    return next({ context })
  },
)

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

    const memberships = await db
      .select()
      .from(companyMember)
      .where(eq(companyMember.userId, context.user.id))
      .limit(2)

    if (memberships.length > 1) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Multiple company memberships found for user",
      })
    }

    const membership = memberships[0]

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

/** Department head — requires dept_head role, injects departmentId + universityId. */
export const deptHeadProcedure = authedProcedure.use(
  async ({ context, next }) => {
    if (context.user.role !== "dept_head") {
      throw new ORPCError("FORBIDDEN", {
        message: "Department head access required",
      })
    }

    if (!context.user.universityId) {
      throw new ORPCError("FORBIDDEN", {
        message: "Department head must belong to a university",
      })
    }

    if (!context.user.departmentId) {
      throw new ORPCError("FORBIDDEN", {
        message: "Department head must be assigned to a department",
      })
    }

    return next({
      context: {
        ...context,
        departmentId: context.user.departmentId,
        universityId: context.user.universityId,
      },
    })
  },
)
