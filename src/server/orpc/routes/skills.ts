import "server-only"

import { z } from "zod"

import { publicProcedureStandard } from "@/server/orpc/rate-limited-procedures"
import { listSkillTags } from "@/server/services/skills/list"

export const listSkillTagsProcedure = publicProcedureStandard
  .input(
    z
      .object({
        category: z.string().optional(),
        limit: z.coerce.number().int().min(1).max(500).optional(),
        offset: z.coerce.number().int().min(0).optional(),
      })
      .optional(),
  )
  .handler(async ({ input }) =>
    listSkillTags({
      category: input?.category,
      limit: input?.limit,
      offset: input?.offset,
    }),
  )
