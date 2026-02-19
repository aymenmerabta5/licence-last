import "server-only"

import { asc, eq } from "drizzle-orm"

import { db } from "@/server/db"
import { departmentSkill } from "@/server/db/schema/departments"
import { skillTag } from "@/server/db/schema/skills"

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
  // Fetch department skill IDs
  const deptSkillRows = await db
    .select({ skillTagId: departmentSkill.skillTagId })
    .from(departmentSkill)
    .where(eq(departmentSkill.departmentId, departmentId))

  const deptSkillIdSet = new Set(deptSkillRows.map((r) => r.skillTagId))

  // Fetch ALL skills (no filter)
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
