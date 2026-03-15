import "server-only"

import { ORPCError, os } from "@orpc/server"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { deriveEffectiveUserRole } from "@/lib/effective-role"
import { checkAdminApproval } from "@/server/auth/approval-gate"
import { db } from "@/server/db"
import { companyMember } from "@/server/db/schema/companies"
import { studentProfile } from "@/server/db/schema/students"
import { isServiceError } from "@/server/services/errors"
import { getUniversityMembership } from "@/server/services/universities/membership"

interface SessionUser {
  id: string
  email: string
  name?: string | null
  image?: string | null
  role?: string | null
  banned?: boolean | null
  onboardingCompleted?: boolean | null
  twoFactorEnabled?: boolean | null
  universityId?: string | null
  departmentId?: string | null
  [key: string]: unknown
}

function buildLegacyMembership(user: SessionUser) {
  if (user.role !== "dept_head" || !user.universityId) {
    return null
  }

  return {
    userId: user.id,
    universityId: user.universityId,
    role: "department_head" as const,
    departmentId: user.departmentId ?? null,
    createdAt: new Date(0),
    updatedAt: new Date(0),
  }
}

async function resolveUniversityMembership(user: SessionUser) {
  if (user.role === "university_admin") {
    return getUniversityMembership(user.id)
  }

  return buildLegacyMembership(user)
}

async function resolveContextUser(user: SessionUser) {
  const universityMembership = await resolveUniversityMembership(user)
  const effectiveRole =
    deriveEffectiveUserRole({
      userRole: user.role,
      universityMembershipRole: universityMembership?.role ?? null,
    }) ??
    user.role ??
    "student"

  return {
    user: {
      ...user,
      role: effectiveRole,
      effectiveRole,
      rawRole: user.role ?? null,
      universityId:
        universityMembership?.universityId ?? user.universityId ?? null,
      departmentId:
        universityMembership?.departmentId ?? user.departmentId ?? null,
      universityMembershipRole: universityMembership?.role ?? null,
      universityDepartmentId:
        universityMembership?.departmentId ?? user.departmentId ?? null,
    },
    universityMembership,
  }
}

/**
 * Check if a user role has admin privileges (university_admin or super_admin).
 */
export function isAdminRole(role: string | null | undefined): boolean {
  return role === "university_admin" || role === "super_admin"
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

  try {
    const resolvedUser = await resolveContextUser(session.user)
    return next({
      context: {
        session: session.session,
        user: resolvedUser.user,
        universityMembership: resolvedUser.universityMembership,
      },
    })
  } catch (error) {
    if (
      isServiceError(error) &&
      error.code === "UNIVERSITY_MEMBERSHIP_CONFLICT"
    ) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Multiple university memberships found for user",
      })
    }

    throw error
  }
})

/** Enforce super-admin approval for onboarded company/university admins. */
async function assertApprovedAdminAccess(user: {
  id: string
  role?: string | null
  rawRole?: string | null
  onboardingCompleted?: boolean | null
}) {
  try {
    const approval = await checkAdminApproval({
      ...user,
      role:
        user.rawRole === "dept_head"
          ? "university_admin"
          : (user.rawRole ?? user.role),
    })

    if (approval.ok) {
      return
    }

    const message =
      approval.reason === "company_suspended"
        ? "Company account is suspended"
        : approval.reason === "company_pending" ||
            approval.reason === "company_rejected"
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

/** Admin — requires true university admin or super_admin role. */
export const adminProcedure = authedProcedure.use(async ({ context, next }) => {
  if (!isAdminRole(context.user.role)) {
    throw new ORPCError("FORBIDDEN", {
      message: "Admin access required",
    })
  }
  return next({ context })
})

/** University-scoped access — allows university admins, department heads, and super admins. */
export const universityProcedure = authedProcedure.use(
  async ({ context, next }) => {
    if (
      context.user.role !== "university_admin" &&
      context.user.role !== "dept_head" &&
      context.user.role !== "super_admin"
    ) {
      throw new ORPCError("FORBIDDEN", {
        message: "University access required",
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

/** Company owner — requires owner membership role. */
export const companyOwnerProcedure = companyAdminProcedure.use(
  async ({ context, next }) => {
    if (context.companyMembership.role !== "owner") {
      throw new ORPCError("FORBIDDEN", {
        message: "Company owner access required",
      })
    }

    return next({ context })
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

/** Department head — requires department_head membership and a current department assignment. */
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

    if (!context.user.universityDepartmentId) {
      throw new ORPCError("FORBIDDEN", {
        message: "Department head must be assigned to a department",
      })
    }

    return next({
      context: {
        ...context,
        departmentId: context.user.universityDepartmentId,
        universityId: context.user.universityId,
      },
    })
  },
)
