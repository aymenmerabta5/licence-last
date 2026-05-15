import "server-only"

import { eq } from "drizzle-orm"
import { z } from "zod"

import { CACHE_TAGS } from "@/lib/cache"
import {
  adminProcedureStandard,
  publicProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import { createServiceORPCError } from "@/server/orpc/utils/service-error"
import { db } from "@/server/db"
import { skillCategory } from "@/server/db/schema"
import { createSkill } from "@/server/services/skills/create"
import { listSkillTags } from "@/server/services/skills/list"
import { listSkillTagsPrioritized } from "@/server/services/skills/list-prioritized"
import { ServiceError } from "@/server/services/errors"
import { revalidateTag } from "next/cache"

export const listSkillTagsProcedure = publicProcedureStandard
  .input(
    z
      .object({
        categoryId: z.coerce.number().optional(),
        status: z.string().optional(),
        limit: z.coerce.number().int().min(1).max(500).optional(),
        offset: z.coerce.number().int().min(0).max(10000).optional(),
      })
      .optional(),
  )
  .handler(async ({ input }) =>
    listSkillTags({
      categoryId: input?.categoryId,
      status: input?.status,
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
      categoryId: z.coerce.number().optional(),
      force: z.boolean().optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      let resolvedCategoryId = input.categoryId
      if (resolvedCategoryId == null) {
        const categoryName = input.category?.trim() || "Uncategorized"
        const [existingCategory] = await db
          .select({ id: skillCategory.id })
          .from(skillCategory)
          .where(eq(skillCategory.name, categoryName))
          .limit(1)

        if (existingCategory) {
          resolvedCategoryId = existingCategory.id
        } else {
          const [newCategory] = await db
            .insert(skillCategory)
            .values({
              name: categoryName,
              slug: categoryName.toLowerCase().replace(/\s+/g, "-"),
            })
            .returning({ id: skillCategory.id })
          resolvedCategoryId = newCategory.id
        }
      }

      const result = await createSkill(
        {
          name: input.name,
          categoryId: resolvedCategoryId!,
          force: input.force,
        },
        context.user.id,
        context.user.rawRole ?? context.user.role ?? "unknown",
      )

      if (result.status === "similar_exists") {
        throw new ServiceError(
          "SIMILAR_SKILLS_EXIST",
          `Similar skills already exist: ${result.similar.map((s) => s.name).join(", ")}`,
        )
      }

      revalidateTag(CACHE_TAGS.SKILLS, "max")

      return {
        ...result.skill,
        created: result.status === "created",
      }
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          SKILL_NAME_REQUIRED: "BAD_REQUEST",
          SKILL_NAME_TOO_LONG: "BAD_REQUEST",
          SIMILAR_SKILLS_EXIST: "CONFLICT",
        },
        fallbackMessage: "Failed to create skill",
      })
    }
  })
