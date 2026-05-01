import "server-only"

import { z } from "zod"

import { primaryUserRoleSchema } from "@/lib/schemas/enums"
import {
  adminProcedureGenerous,
  adminProcedureStandard,
  superAdminProcedureGenerous,
  superAdminProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import { throwCodedORPCError } from "@/server/orpc/utils/service-error"
import { banUser, unbanUser } from "@/server/services/admin/ban-user"
import { createUser } from "@/server/services/admin/create-user"
import { listUniversityUsers } from "@/server/services/admin/list-university-users"
import { listUsers } from "@/server/services/admin/list-users"
import { removeUser } from "@/server/services/admin/remove-user"
import {
  listUserSessions,
  revokeAllSessions,
  revokeSession,
} from "@/server/services/admin/session-management"
import { setUserPassword } from "@/server/services/admin/set-password"
import { setUserRole } from "@/server/services/admin/set-role"
import { updateUser } from "@/server/services/admin/update-user"
import { sanitizeIpAddress } from "@/lib/utils"

const listUsersInputSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).max(10000).optional().default(0),
  searchValue: z.string().optional(),
  searchField: z.enum(["email", "name"]).optional(),
  searchOperator: z.enum(["contains", "starts_with", "ends_with"]).optional(),
  sortBy: z.enum(["email", "name", "role", "createdAt"]).optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
  filterField: z.enum(["email", "name", "role", "id", "banned"]).optional(),
  filterValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  filterOperator: z.enum(["eq", "ne", "lt", "lte", "gt", "gte"]).optional(),
})

function assertUserManagementRole(role: string | null | undefined) {
  if (role !== "super_admin" && role !== "university_admin") {
    throwCodedORPCError("FORBIDDEN", "USER_MANAGEMENT_ACCESS_REQUIRED", {
      message:
        "User management access requires super admin or university admin role",
    })
  }
}

export const listUsersProcedure = adminProcedureGenerous
  .input(listUsersInputSchema)
  .handler(async ({ input, context }) => {
    assertUserManagementRole(context.user.role)

    if (context.user.role === "super_admin") {
      return listUsers(input)
    }

    if (!context.user.universityId) {
      throwCodedORPCError("BAD_REQUEST", "ADMIN_MUST_BELONG_TO_UNIVERSITY", {
        message: "University admin must belong to a university",
      })
    }

    return listUniversityUsers({
      ...input,
      universityId: context.user.universityId,
    })
  })

export const createUserProcedure = superAdminProcedureStandard
  .input(
    z
      .object({
        email: z.email(),
        password: z.string().min(8).max(128),
        name: z.string().min(2).max(120),
        role: primaryUserRoleSchema,
        universityId: z.string().min(1).optional(),
      })
      .refine(
        (data) => {
          if (data.role === "student" || data.role === "university_admin") {
            return !!data.universityId
          }
          return true
        },
        {
          message: "University is required for this role",
          path: ["universityId"],
        },
      ),
  )
  .handler(async ({ input }) => createUser(input))

export const setRoleProcedure = superAdminProcedureStandard
  .input(
    z.object({
      userId: z.string().min(1),
      role: primaryUserRoleSchema,
    }),
  )
  .handler(async ({ input }) => setUserRole(input.userId, input.role))

export const banUserProcedure = adminProcedureStandard
  .input(
    z.object({
      userId: z.string().min(1),
      banReason: z.string().optional(),
      banExpiresIn: z.number().positive().optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    if (context.user.role !== "super_admin") {
      throwCodedORPCError("FORBIDDEN", "SUPER_ADMIN_ACCESS_REQUIRED", {
        message: "Super admin access required",
      })
    }

    return banUser(input)
  })

export const unbanUserProcedure = adminProcedureStandard
  .input(z.object({ userId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    if (context.user.role !== "super_admin") {
      throwCodedORPCError("FORBIDDEN", "SUPER_ADMIN_ACCESS_REQUIRED", {
        message: "Super admin access required",
      })
    }

    return unbanUser(input.userId)
  })

export const removeUserProcedure = adminProcedureStandard
  .input(z.object({ userId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    if (context.user.role !== "super_admin") {
      throwCodedORPCError("FORBIDDEN", "SUPER_ADMIN_ACCESS_REQUIRED", {
        message: "Super admin access required",
      })
    }

    return removeUser(input.userId)
  })

export const setPasswordProcedure = superAdminProcedureStandard
  .input(
    z.object({
      userId: z.string().min(1),
      newPassword: z.string().min(8).max(128),
    }),
  )
  .handler(async ({ input }) =>
    setUserPassword(input.userId, input.newPassword),
  )

export const updateUserProcedure = superAdminProcedureStandard
  .input(
    z.object({
      userId: z.string().min(1),
      name: z.string().min(2).max(120).optional(),
      email: z.string().email().optional(),
      role: primaryUserRoleSchema.optional(),
    }),
  )
  .handler(async ({ input }) => {
    const { userId, ...data } = input
    return updateUser(userId, data)
  })

export const listUserSessionsProcedure = superAdminProcedureGenerous
  .input(z.object({ userId: z.string().min(1) }))
  .handler(async ({ input }) => {
    const result = await listUserSessions(input.userId)
    const sessions = Array.isArray(result)
      ? result
      : Array.isArray((result as { sessions?: unknown[] } | null)?.sessions)
        ? ((result as { sessions?: unknown[] }).sessions ?? [])
        : []

    return sessions.map((session) => {
      const record =
        session && typeof session === "object"
          ? (session as Record<string, unknown>)
          : {}
      const token =
        typeof record.token === "string" && record.token.length > 0
          ? record.token
          : null

      return {
        id: typeof record.id === "string" ? record.id : "",
        tokenPrefix: token ? token.slice(-4) : null,
        ipAddress: sanitizeIpAddress(
          typeof record.ipAddress === "string" ? record.ipAddress : null,
        ),
        userAgent:
          typeof record.userAgent === "string" ? record.userAgent : null,
        createdAt: record.createdAt,
        expiresAt: record.expiresAt,
        impersonatedBy:
          typeof record.impersonatedBy === "string"
            ? record.impersonatedBy
            : null,
      }
    })
  })

export const revokeSessionProcedure = superAdminProcedureStandard
  .input(
    z.object({
      userId: z.string().min(1),
      sessionId: z.string().min(1),
    }),
  )
  .handler(async ({ input }) => {
    const result = await revokeSession(input.userId, input.sessionId)

    if (!result) {
      throwCodedORPCError("NOT_FOUND", "SESSION_NOT_FOUND", {
        message: "Session not found",
      })
    }

    return result
  })

export const revokeAllSessionsProcedure = superAdminProcedureStandard
  .input(z.object({ userId: z.string().min(1) }))
  .handler(async ({ input }) => revokeAllSessions(input.userId))
