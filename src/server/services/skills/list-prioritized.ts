"use cache"

import "server-only"

import { asc, eq } from "drizzle-orm"
import { cacheTag } from "next/cache"
import { CACHE_PROFILES, CACHE_TAGS } from "@/lib/cache"
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
  CACHE_PROFILES.REFERENCE()
  cacheTag(CACHE_TAGS.SKILLS, `department-${departmentId}`)

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
    .where(eq(skillTag.status, "active"))
    .orderBy(asc(skillTag.name))

  if (deptSkillIdSet.size === 0) {
    return { departmentSkills: [], otherSkills: allSkills }
  }

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
