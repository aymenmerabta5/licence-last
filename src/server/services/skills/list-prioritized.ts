import "server-only"

import { asc } from "drizzle-orm"

import { db } from "@/server/db"
import { skillTag } from "@/server/db/schema/skills"
import { getEffectiveDepartmentSkillIds } from "@/server/services/departments/get-effective-skills"

interface Skill {
  id: string
  name: string
  slug: string
  category: string | null
}

export interface ListSkillTagsPrioritizedResult {
  departmentSkills: Skill[]
  otherSkills: Skill[]
}

export async function listSkillTagsPrioritized(
  departmentId: string,
): Promise<ListSkillTagsPrioritizedResult> {
  const deptSkillIdSet = new Set(
    await getEffectiveDepartmentSkillIds(departmentId),
  )

  const allSkills = await db
    .select({
      id: skillTag.id,
      name: skillTag.name,
      slug: skillTag.slug,
      category: skillTag.category,
    })
    .from(skillTag)
    .orderBy(asc(skillTag.name))

  const departmentSkills: Skill[] = []
  const otherSkills: Skill[] = []

  for (const skill of allSkills) {
    if (deptSkillIdSet.has(skill.id)) {
      departmentSkills.push(skill)
    } else {
      otherSkills.push(skill)
    }
  }

  return { departmentSkills, otherSkills }
}
