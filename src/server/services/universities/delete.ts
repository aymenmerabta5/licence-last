import "server-only"

import { and, eq, inArray } from "drizzle-orm"

import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { university } from "@/server/db/schema/universities"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"

const log = createModuleLogger("services/universities/delete")

const UNIVERSITY_ADMIN_ROLES = ["university_admin", "dept_head"] as const

/**
 * Delete a university and cleanup user role/state references.
 * Pure business logic — no auth checks here.
 */
export async function deleteUniversity(universityId: string) {
  const [existing] = await db
    .select({ id: university.id })
    .from(university)
    .where(eq(university.id, universityId))
    .limit(1)

  if (!existing) {
    throw new ServiceError("UNIVERSITY_NOT_FOUND", "University not found")
  }

  log.info({ universityId }, "Deleting university")

  const affectedUserIds = await db.transaction(async (tx) => {
    const linkedUsers = await tx
      .select({ userId: user.id })
      .from(user)
      .where(eq(user.universityId, universityId))

    await tx
      .update(user)
      .set({
        role: "student",
        departmentId: null,
      })
      .where(
        and(
          eq(user.universityId, universityId),
          inArray(user.role, UNIVERSITY_ADMIN_ROLES),
        ),
      )

    await tx
      .update(user)
      .set({
        universityId: null,
        departmentId: null,
      })
      .where(eq(user.universityId, universityId))

    await tx
      .delete(university)
      .where(eq(university.id, universityId))

    return linkedUsers.map((linkedUser) => linkedUser.userId)
  })

  log.info(
    { universityId, affectedUsers: affectedUserIds.length, event: "university_deleted" },
    "University deleted",
  )

  return {
    success: true as const,
    universityId,
    affectedUserIds,
  }
}
