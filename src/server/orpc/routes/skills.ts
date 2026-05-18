import { eq } from "drizzle-orm"
import { revalidateTag } from "next/cache"
import { z } from "zod"
import { CACHE_TAGS } from "@/lib/cache"
import { db } from "@/server/db"
import { skillCategory } from "@/server/db/schema"
import { departmentCategory } from "@/server/db/schema/departments"
import {
  authedProcedureStandard,
  publicProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import {
  createServiceORPCError,
  throwCodedORPCError,
} from "@/server/orpc/utils/service-error"
import { ServiceError } from "@/server/services/errors"
import { createSkill } from "@/server/services/skills/create"
import { listSkillCategories } from "@/server/services/skills/list-categories"
import { listSkillTags } from "@/server/services/skills/list"
import { listSkillTagsPrioritized } from "@/server/services/skills/list-prioritized"

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

export const createSkillProcedure = authedProcedureStandard
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
      const userRole = context.user.rawRole ?? context.user.role ?? "unknown"

      if (
        userRole !== "super_admin" &&
        userRole !== "company_admin" &&
        userRole !== "company_owner" &&
        userRole !== "dept_head"
      ) {
        throwCodedORPCError("FORBIDDEN", "SKILL_CREATE_ACCESS_REQUIRED", {
          message: "You do not have permission to create skills",
        })
      }

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

      if (userRole === "dept_head" && context.user.universityDepartmentId) {
        const allowedCategories = await db
          .select({ categoryId: departmentCategory.categoryId })
          .from(departmentCategory)
          .where(
            eq(
              departmentCategory.departmentId,
              context.user.universityDepartmentId,
            ),
          )

        const allowedCategoryIds = allowedCategories.map(
          (row) => row.categoryId,
        )

        if (!allowedCategoryIds.includes(resolvedCategoryId!)) {
          throw new ServiceError(
            "FORBIDDEN",
            "This category is not assigned to your department",
          )
        }
      }

      const result = await createSkill(
        {
          name: input.name,
          categoryId: resolvedCategoryId!,
          force: input.force,
        },
        context.user.id,
        userRole,
      )

      if (result.status === "similar_exists") {
        return {
          status: "similar_exists" as const,
          similar: result.similar,
        }
      }

      if (result.status === "exists") {
        throw new ServiceError(
          "SKILL_ALREADY_EXISTS",
          `Skill '${input.name}' already exists`,
        )
      }

      revalidateTag(CACHE_TAGS.SKILLS, "max")

      return {
        ...result.skill,
        created: true,
      }
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          SKILL_NAME_REQUIRED: "BAD_REQUEST",
          SKILL_NAME_TOO_LONG: "BAD_REQUEST",
          SKILL_ALREADY_EXISTS: "CONFLICT",
          FORBIDDEN: "FORBIDDEN",
        },
        fallbackMessage: "Failed to create skill",
      })
    }
  })

export const listSkillCategoriesProcedure = publicProcedureStandard.handler(
  async () => listSkillCategories(),
)
