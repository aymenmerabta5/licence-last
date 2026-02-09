import { z } from "zod"

import { publicProcedure } from "../middleware"
import { listSkillTags } from "@/server/services/skills/list"

/* ── Reads ── */

export const listSkillTagsProcedure = publicProcedure
  .input(
    z
      .object({
        category: z.string().optional(),
      })
      .optional(),
  )
  .handler(async ({ input }) => listSkillTags(input?.category))
