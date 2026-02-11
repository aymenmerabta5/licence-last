"use cache"

import "server-only"

import { eq } from "drizzle-orm"
import { cacheTag } from "next/cache"

import { db } from "@/server/db"
import { university } from "@/server/db/schema/universities"
import { CACHE_TAGS, CACHE_PROFILES } from "@/lib/cache"

/**
 * Get university by ID.
 * Cached indefinitely (university data is static).
 */
export async function getUniversityById(id: string) {
  CACHE_PROFILES.STATIC()
  cacheTag(CACHE_TAGS.UNIVERSITIES)
  cacheTag(`${CACHE_TAGS.UNIVERSITIES}-${id}`)
  const [row] = await db
    .select({
      id: university.id,
      name: university.name,
      abbreviation: university.abbreviation,
      city: university.city,
    })
    .from(university)
    .where(eq(university.id, id))
    .limit(1)

  return row ?? null
}
