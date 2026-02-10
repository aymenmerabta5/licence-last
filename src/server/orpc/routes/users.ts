import { z } from "zod"

import { authedProcedure, superAdminProcedure } from "../middleware"
import { getMe } from "@/server/services/users/get-me"
import { updateMe } from "@/server/services/users/update-me"
import { promoteUser } from "@/server/services/users/promote"

export const getMeProcedure = authedProcedure.handler(async ({ context }) =>
  getMe(context.user),
)

export const updateMeProcedure = authedProcedure
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

export const promoteUserProcedure = superAdminProcedure
  .input(
    z.object({
      userId: z.string().min(1),
      newRole: z.enum(["student", "company_admin", "admin", "super_admin"]),
    }),
  )
  .handler(async ({ input }) => promoteUser(input.userId, input.newRole))
