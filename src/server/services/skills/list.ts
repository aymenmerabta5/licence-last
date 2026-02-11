"use cache"

import "server-only"

import { eq, asc } from "drizzle-orm"
import { cacheTag } from "next/cache"

import { db } from "@/server/db"
import { skillTag } from "@/server/db/schema/skills"
import { CACHE_TAGS, CACHE_PROFILES } from "@/lib/cache"

/**
 * List all skill tags, optionally filtered by category.
 * Cached for 1 hour (reference data changes infrequently).
 */
export async function listSkillTags(category?: string) {
  CACHE_PROFILES.REFERENCE()
  cacheTag(CACHE_TAGS.SKILLS)
  if (category) {
    cacheTag(`${CACHE_TAGS.SKILLS}-${category}`)
  }
  const query = db
    .select({
      id: skillTag.id,
      name: skillTag.name,
      slug: skillTag.slug,
      category: skillTag.category,
    })
    .from(skillTag)
    .orderBy(asc(skillTag.name))

  if (category) {
    return query.where(eq(skillTag.category, category))
  }

  return query
}
