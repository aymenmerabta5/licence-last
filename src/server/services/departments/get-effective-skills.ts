import "server-only"

import { eq, inArray } from "drizzle-orm"

import { db } from "@/server/db"
import { departmentCategory, departmentSkill } from "@/server/db/schema"
import { skillTag } from "@/server/db/schema/skills"

export async function getEffectiveDepartmentSkillIds(
  departmentId: string,
): Promise<string[]> {
  const deptCategories = await db
    .select({ categoryId: departmentCategory.categoryId })
    .from(departmentCategory)
    .where(eq(departmentCategory.departmentId, departmentId))

  const categoryIds = deptCategories.map((dc) => dc.categoryId)
  let skillIds: string[] = []

  if (categoryIds.length > 0) {
    const categorySkills = await db
      .select({ id: skillTag.id })
      .from(skillTag)
      .where(inArray(skillTag.categoryId, categoryIds))

    skillIds = categorySkills.map((s) => s.id)
  }

  const overrides = await db
    .select({
      skillTagId: departmentSkill.skillTagId,
      action: departmentSkill.action,
    })
    .from(departmentSkill)
    .where(eq(departmentSkill.departmentId, departmentId))

  const addSet = new Set(skillIds)
  for (const override of overrides) {
    if (override.action === "add") addSet.add(override.skillTagId)
    else if (override.action === "remove") addSet.delete(override.skillTagId)
  }

  return Array.from(addSet)
}
