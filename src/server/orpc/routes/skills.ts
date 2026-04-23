import "server-only"

import { z } from "zod"

import {
  adminProcedureStandard,
  publicProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import { createServiceORPCError } from "@/server/orpc/utils/service-error"
import { createSkill } from "@/server/services/skills/create"
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
  .handler(async ({ input }) => listSkillTagsPrioritized(input.departmentId))

export const createSkillProcedure = adminProcedureStandard
  .input(
    z.object({
      name: z.string().trim().min(1).max(100),
      category: z.string().trim().max(50).optional(),
    }),
  )
  .handler(async ({ input }) => {
    try {
      return createSkill(input.name, input.category)
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          SKILL_NAME_REQUIRED: "BAD_REQUEST",
          SKILL_NAME_TOO_LONG: "BAD_REQUEST",
        },
        fallbackMessage: "Failed to create skill",
      })
    }
  })
