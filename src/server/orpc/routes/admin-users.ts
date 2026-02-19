import "server-only"

import { ORPCError } from "@orpc/server"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { userRoleSchema } from "@/lib/schemas/enums"
import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import {
  adminProcedureGenerous,
  adminProcedureStandard,
  superAdminProcedureGenerous,
  superAdminProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
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
    throw new ORPCError("FORBIDDEN", {
      message:
        "User management access requires super admin or university admin role",
    })
  }
}

async function assertUniversityScopedTarget(args: {
  targetUserId: string
  actingUserId: string
  actingUniversityId: string
  forbidSelf?: boolean
}) {
  const {
    targetUserId,
    actingUserId,
    actingUniversityId,
    forbidSelf = false,
  } = args
  const [targetUser] = await db
    .select({
      id: user.id,
      role: user.role,
      universityId: user.universityId,
    })
    .from(user)
    .where(eq(user.id, targetUserId))
    .limit(1)

  if (!targetUser) {
    throw new ORPCError("NOT_FOUND", {
      message: "User not found",
    })
  }

  if (forbidSelf && targetUser.id === actingUserId) {
    throw new ORPCError("BAD_REQUEST", {
      message: "You cannot perform this action on your own account",
    })
  }

  if (targetUser.role === "super_admin") {
    throw new ORPCError("FORBIDDEN", {
      message: "Super admin accounts cannot be managed by university admins",
    })
  }

  if (targetUser.universityId !== actingUniversityId) {
    throw new ORPCError("FORBIDDEN", {
      message: "Target user does not belong to your university",
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
      throw new ORPCError("BAD_REQUEST", {
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
    z.object({
      email: z.string().email(),
      password: z.string().min(8).max(128),
      name: z.string().min(2).max(120),
      role: userRoleSchema,
    }),
  )
  .handler(async ({ input }) => createUser(input))

export const setRoleProcedure = superAdminProcedureStandard
  .input(
    z.object({
      userId: z.string().min(1),
      role: userRoleSchema,
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
    assertUserManagementRole(context.user.role)

    if (context.user.role === "super_admin") {
      return banUser(input)
    }

    if (!context.user.universityId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "University admin must belong to a university",
      })
    }

    await assertUniversityScopedTarget({
      targetUserId: input.userId,
      actingUserId: context.user.id,
      actingUniversityId: context.user.universityId,
      forbidSelf: true,
    })

    return banUser(input)
  })

export const unbanUserProcedure = adminProcedureStandard
  .input(z.object({ userId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    assertUserManagementRole(context.user.role)

    if (context.user.role === "super_admin") {
      return unbanUser(input.userId)
    }

    if (!context.user.universityId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "University admin must belong to a university",
      })
    }

    await assertUniversityScopedTarget({
      targetUserId: input.userId,
      actingUserId: context.user.id,
      actingUniversityId: context.user.universityId,
    })

    return unbanUser(input.userId)
  })

export const removeUserProcedure = adminProcedureStandard
  .input(z.object({ userId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    assertUserManagementRole(context.user.role)

    if (context.user.role === "super_admin") {
      return removeUser(input.userId)
    }

    if (!context.user.universityId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "University admin must belong to a university",
      })
    }

    await assertUniversityScopedTarget({
      targetUserId: input.userId,
      actingUserId: context.user.id,
      actingUniversityId: context.user.universityId,
      forbidSelf: true,
    })

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
      role: userRoleSchema.optional(),
    }),
  )
  .handler(async ({ input }) => {
    const { userId, ...data } = input
    return updateUser(userId, data)
  })

export const listUserSessionsProcedure = superAdminProcedureGenerous
  .input(z.object({ userId: z.string().min(1) }))
  .handler(async ({ input }) => listUserSessions(input.userId))

export const revokeSessionProcedure = superAdminProcedureStandard
  .input(z.object({ sessionToken: z.string().min(1) }))
  .handler(async ({ input }) => revokeSession(input.sessionToken))

export const revokeAllSessionsProcedure = superAdminProcedureStandard
  .input(z.object({ userId: z.string().min(1) }))
  .handler(async ({ input }) => revokeAllSessions(input.userId))
