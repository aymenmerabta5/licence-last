"use cache"

import "server-only"

import { eq } from "drizzle-orm"
import { cacheTag } from "next/cache"
import { CACHE_PROFILES, CACHE_TAGS } from "@/lib/cache"
import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { university } from "@/server/db/schema/universities"

/**
 * Get university by ID.
 * Cached indefinitely (university data is static).
 */
export async function getUniversityById(id: string) {
  CACHE_PROFILES.STATIC()
  cacheTag(CACHE_TAGS.UNIVERSITIES)
  cacheTag(`${CACHE_TAGS.UNIVERSITIES}-${id}`)
  const [row] = await db
    .select()
    .from(university)
    .where(eq(university.id, id))
    .limit(1)

  return row ?? null
}

/**
 * Get the university a user belongs to (via user.universityId).
 * Used for admin users to look up their university.
 */
export async function getUniversityByUserId(userId: string) {
  CACHE_PROFILES.STATIC()
  cacheTag(CACHE_TAGS.UNIVERSITIES)
  cacheTag(`${CACHE_TAGS.UNIVERSITIES}-user-${userId}`)
  const [row] = await db
    .select({
      id: university.id,
      name: university.name,
      abbreviation: university.abbreviation,
      city: university.city,
      status: university.status,
      rejectionReason: university.rejectionReason,
    })
    .from(user)
    .innerJoin(university, eq(user.universityId, university.id))
    .where(eq(user.id, userId))
    .limit(1)

  return row ?? null
}
