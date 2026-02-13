import "server-only"

import { z } from "zod"

import {
  superAdminProcedureGenerous,
  superAdminProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import { userRoleSchema } from "@/lib/schemas/enums"
import { listUsers } from "@/server/services/admin/list-users"
import { createUser } from "@/server/services/admin/create-user"
import { setUserRole } from "@/server/services/admin/set-role"
import { banUser, unbanUser } from "@/server/services/admin/ban-user"
import { setUserPassword } from "@/server/services/admin/set-password"
import { removeUser } from "@/server/services/admin/remove-user"
import { updateUser } from "@/server/services/admin/update-user"
import {
  listUserSessions,
  revokeSession,
  revokeAllSessions,
} from "@/server/services/admin/session-management"

export const listUsersProcedure = superAdminProcedureGenerous
  .input(
    z.object({
      limit: z.number().min(1).max(100).optional().default(20),
      offset: z.number().min(0).optional().default(0),
      searchValue: z.string().optional(),
      searchField: z.enum(["email", "name"]).optional(),
      searchOperator: z.enum(["contains", "starts_with", "ends_with"]).optional(),
      sortBy: z.string().optional(),
      sortDirection: z.enum(["asc", "desc"]).optional(),
      filterField: z.string().optional(),
      filterValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
      filterOperator: z.enum(["eq", "ne", "lt", "lte", "gt", "gte"]).optional(),
    }),
  )
  .handler(async ({ input }) => listUsers(input))

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

export const banUserProcedure = superAdminProcedureStandard
  .input(
    z.object({
      userId: z.string().min(1),
      banReason: z.string().optional(),
      banExpiresIn: z.number().positive().optional(),
    }),
  )
  .handler(async ({ input }) => banUser(input))

export const unbanUserProcedure = superAdminProcedureStandard
  .input(z.object({ userId: z.string().min(1) }))
  .handler(async ({ input }) => unbanUser(input.userId))

export const removeUserProcedure = superAdminProcedureStandard
  .input(z.object({ userId: z.string().min(1) }))
  .handler(async ({ input }) => removeUser(input.userId))

export const setPasswordProcedure = superAdminProcedureStandard
  .input(
    z.object({
      userId: z.string().min(1),
      newPassword: z.string().min(8).max(128),
    }),
  )
  .handler(async ({ input }) => setUserPassword(input.userId, input.newPassword))

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
