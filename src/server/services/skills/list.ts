"use cache"

import "server-only"

import { and, asc, eq } from "drizzle-orm"
import { cacheTag } from "next/cache"
import { CACHE_PROFILES, CACHE_TAGS } from "@/lib/cache"
import { db } from "@/server/db"
import { skillTag } from "@/server/db/schema/skills"

export interface ListSkillTagsInput {
  categoryId?: number
  status?: string
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
  if (input?.categoryId) {
    cacheTag(`${CACHE_TAGS.SKILLS}-category-${input.categoryId}`)
  }
  if (input?.status) {
    cacheTag(`${CACHE_TAGS.SKILLS}-status-${input.status}`)
  }

  const limit = Math.min(input?.limit ?? 100, 500)
  const offset = input?.offset ?? 0

  const conditions = []
  if (input?.categoryId) {
    conditions.push(eq(skillTag.categoryId, input.categoryId))
  }
  if (input?.status) {
    conditions.push(
      eq(skillTag.status, input.status as "active" | "deprecated"),
    )
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
