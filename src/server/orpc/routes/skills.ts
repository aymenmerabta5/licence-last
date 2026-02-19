import "server-only"

import { z } from "zod"

import { publicProcedureStandard } from "@/server/orpc/rate-limited-procedures"
import { listSkillTags } from "@/server/services/skills/list"
import { listSkillTagsPrioritized } from "@/server/services/skills/list-prioritized"

export const listSkillTagsProcedure = publicProcedureStandard
  .input(
    z
      .object({
        category: z.string().optional(),
        departmentId: z.string().optional(),
        limit: z.coerce.number().int().min(1).max(500).optional(),
        offset: z.coerce.number().int().min(0).max(10000).optional(),
      })
      .optional(),
  )
  .handler(async ({ input }) =>
    listSkillTags({
      category: input?.category,
      departmentId: input?.departmentId,
      limit: input?.limit,
      offset: input?.offset,
    }),
  )

export const listSkillTagsPrioritizedProcedure = publicProcedureStandard
  .input(z.object({ departmentId: z.string().min(1) }))
  .handler(async ({ input }) =>
    listSkillTagsPrioritized(input.departmentId),
  )
