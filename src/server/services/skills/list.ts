"use cache"

import "server-only"

import { eq, asc } from "drizzle-orm"
import { cacheTag } from "next/cache"

import { db } from "@/server/db"
import { skillTag } from "@/server/db/schema/skills"
import { CACHE_TAGS, CACHE_PROFILES } from "@/lib/cache"

export interface ListSkillTagsInput {
  category?: string
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

export async function listSkillTags(input?: ListSkillTagsInput): Promise<ListSkillTagsResult> {
  CACHE_PROFILES.REFERENCE()
  cacheTag(CACHE_TAGS.SKILLS)
  if (input?.category) {
    cacheTag(`${CACHE_TAGS.SKILLS}-${input.category}`)
  }

  const limit = Math.min(input?.limit ?? 100, 500)
  const offset = input?.offset ?? 0

  const query = db
    .select({
      id: skillTag.id,
      name: skillTag.name,
      slug: skillTag.slug,
      category: skillTag.category,
    })
    .from(skillTag)
    .orderBy(asc(skillTag.name))
    .limit(limit + 1)
    .offset(offset)

  const rows = input?.category ? await query.where(eq(skillTag.category, input.category)) : await query

  return {
    skills: rows.slice(0, limit),
    hasMore: rows.length > limit,
  }
}
