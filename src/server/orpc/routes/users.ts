import "server-only"

import { z } from "zod"

import {
  authedProcedureGenerous,
  authedProcedureStandard,
  superAdminProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import { userRoleSchema } from "@/lib/schemas/enums"
import { getMe } from "@/server/services/users/get-me"
import { updateMe } from "@/server/services/users/update-me"
import { promoteUser } from "@/server/services/users/promote"

export const getMeProcedure = authedProcedureGenerous.handler(async ({ context }) =>
  getMe(context.user),
)

export const updateMeProcedure = authedProcedureStandard
  .input(
    z.object({
      name: z.string().trim().min(2).max(120).or(z.literal("")),
    }),
  )
  .handler(async ({ input, context }) => {
    return updateMe(context.user.id, {
      name: input.name === "" ? null : input.name,
    })
  })

export const promoteUserProcedure = superAdminProcedureStandard
  .input(
    z.object({
      userId: z.string().min(1),
      newRole: userRoleSchema,
    }),
  )
  .handler(async ({ input }) => promoteUser(input.userId, input.newRole))
