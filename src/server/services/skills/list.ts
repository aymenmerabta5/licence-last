"use cache"

import "server-only"

import { and, asc, eq, inArray } from "drizzle-orm"
import { cacheTag } from "next/cache"
import { CACHE_PROFILES, CACHE_TAGS } from "@/lib/cache"
import { db } from "@/server/db"
import { departmentSkill } from "@/server/db/schema/departments"
import { skillTag } from "@/server/db/schema/skills"

export interface ListSkillTagsInput {
  category?: string
  departmentId?: string
  limit?: number
  offset?: number
}

export interface ListSkillTagsResult {
  skills: {
    id: string
    name: string
    slug: string
    category: string | null
  }[]
  hasMore: boolean
}

export async function listSkillTags(
  input?: ListSkillTagsInput,
): Promise<ListSkillTagsResult> {
  CACHE_PROFILES.REFERENCE()
  cacheTag(CACHE_TAGS.SKILLS)
  if (input?.category) {
    cacheTag(`${CACHE_TAGS.SKILLS}-${input.category}`)
  }
  if (input?.departmentId) {
    cacheTag(`${CACHE_TAGS.SKILLS}-dept-${input.departmentId}`)
  }

  const limit = Math.min(input?.limit ?? 100, 500)
  const offset = input?.offset ?? 0

  // Build conditions
  const conditions = []
  if (input?.category) {
    conditions.push(eq(skillTag.category, input.category))
  }
  if (input?.departmentId) {
    // Subquery: get skill IDs linked to this department
    const deptSkillIds = db
      .select({ skillTagId: departmentSkill.skillTagId })
      .from(departmentSkill)
      .where(eq(departmentSkill.departmentId, input.departmentId))
    conditions.push(inArray(skillTag.id, deptSkillIds))
  }

  const query = db
    .select({
      id: skillTag.id,
      name: skillTag.name,
      slug: skillTag.slug,
      category: skillTag.category,
    })
    .from(skillTag)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(skillTag.name))
    .limit(limit + 1)
    .offset(offset)

  const rows = await query

  return {
    skills: rows.slice(0, limit),
    hasMore: rows.length > limit,
  }
}
