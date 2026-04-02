import "server-only"

import { ORPCError, os } from "@orpc/server"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getEffectiveRole } from "@/lib/effective-role"
import { checkAdminApproval } from "@/server/auth/approval-gate"
import { db } from "@/server/db"
import { companyMember } from "@/server/db/schema/companies"
import { studentProfile } from "@/server/db/schema/students"
import { isServiceError } from "@/server/services/errors"
import { getUniversityMembership } from "@/server/services/universities/membership"
import { throwCodedORPCError } from "@/server/orpc/utils/service-error"

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

async function resolveContextUser(user: SessionUser) {
  const universityMembership =
    user.role === "university_admin" || user.role === "dept_head"
      ? await getUniversityMembership(user.id)
      : null

  const effectiveRole = getEffectiveRole({ role: user.role })

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
    throwCodedORPCError("FORBIDDEN", "ACCOUNT_SUSPENDED", {
      message: "Account suspended",
    })
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
      throwCodedORPCError("INTERNAL_SERVER_ERROR", "UNIVERSITY_MEMBERSHIP_CONFLICT", {
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
      role: user.rawRole ?? user.role,
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

    throwCodedORPCError("FORBIDDEN", `ADMIN_APPROVAL_${approval.reason.toUpperCase()}`, {
      message,
    })
  } catch (error) {
    if (isServiceError(error) && error.code === "COMPANY_MEMBERSHIP_CONFLICT") {
      throwCodedORPCError("INTERNAL_SERVER_ERROR", "COMPANY_MEMBERSHIP_CONFLICT", {
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
    throwCodedORPCError("FORBIDDEN", "ADMIN_ACCESS_REQUIRED", {
      message: "Admin access required",
    })
  }
  return next({ context })
})

/** University-scoped access — allows university admins and super admins. */
export const universityProcedure = authedProcedure.use(
  async ({ context, next }) => {
    if (
      context.user.role !== "university_admin" &&
      context.user.role !== "super_admin"
    ) {
      throwCodedORPCError("FORBIDDEN", "UNIVERSITY_ACCESS_REQUIRED", {
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
      throwCodedORPCError("FORBIDDEN", "SUPER_ADMIN_ACCESS_REQUIRED", {
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
      throwCodedORPCError("FORBIDDEN", "COMPANY_ADMIN_ACCESS_REQUIRED", {
        message: "Company admin access required",
      })
    }

    const memberships = await db
      .select()
      .from(companyMember)
      .where(eq(companyMember.userId, context.user.id))
      .limit(2)

    if (memberships.length > 1) {
      throwCodedORPCError("INTERNAL_SERVER_ERROR", "COMPANY_MEMBERSHIP_CONFLICT", {
        message: "Multiple company memberships found for user",
      })
    }

    const membership = memberships[0]

    if (!membership) {
      throwCodedORPCError("FORBIDDEN", "NO_COMPANY_MEMBERSHIP", {
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
      throwCodedORPCError("FORBIDDEN", "COMPANY_OWNER_ACCESS_REQUIRED", {
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
      throwCodedORPCError("FORBIDDEN", "STUDENT_ACCESS_REQUIRED", {
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

/** Department head — requires university_admin + department_head membership + department assignment. */
export const deptHeadProcedure = universityProcedure.use(
  async ({ context, next }) => {
    if (context.user.universityMembershipRole !== "department_head") {
      throwCodedORPCError("FORBIDDEN", "DEPARTMENT_HEAD_ACCESS_REQUIRED", {
        message: "Department head access required",
      })
    }

    if (!context.user.universityId) {
      throwCodedORPCError("FORBIDDEN", "DEPARTMENT_HEAD_UNIVERSITY_REQUIRED", {
        message: "Department head must belong to a university",
      })
    }

    if (!context.user.universityDepartmentId) {
      throwCodedORPCError("FORBIDDEN", "DEPARTMENT_HEAD_DEPARTMENT_REQUIRED", {
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
