import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { university } from "@/server/db/schema/universities"

/**
 * Get university status for a user — UNCACHED.
 * Used by auth guards where stale data would lock users out.
 * For display purposes, use the cached getUniversityByUserId() instead.
 */
export async function getUniversityStatusByUserId(userId: string) {
  const [row] = await db
    .select({
      id: university.id,
      status: university.status,
      rejectionReason: university.rejectionReason,
    })
    .from(user)
    .innerJoin(university, eq(user.universityId, university.id))
    .where(eq(user.id, userId))
    .limit(1)

  return row ?? null
}
