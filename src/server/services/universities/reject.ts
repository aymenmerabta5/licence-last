import "server-only"

import { and, eq } from "drizzle-orm"
import { db } from "@/server/db"
import { university } from "@/server/db/schema/universities"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"

const log = createModuleLogger("services/universities/reject")

/**
 * Reject a university application with a reason.
 */
export async function rejectUniversity(
  universityId: string,
  reason: string,
  rejectedByUserId: string,
) {
  log.info({ universityId, rejectedByUserId }, "Rejecting university")

  const [updated] = await db
    .update(university)
    .set({
      status: "rejected",
      rejectionReason: reason,
    })
    .where(
      and(eq(university.id, universityId), eq(university.status, "pending")),
    )
    .returning({ id: university.id, name: university.name })

  if (!updated) {
    const [existing] = await db
      .select({ id: university.id, status: university.status })
      .from(university)
      .where(eq(university.id, universityId))
      .limit(1)

    if (!existing) {
      throw new ServiceError("UNIVERSITY_NOT_FOUND", "University not found")
    }

    throw new ServiceError(
      "UNIVERSITY_INVALID_STATUS_TRANSITION",
      "Only pending universities can be rejected",
    )
  }

  log.info(
    { universityId: updated.id, event: "university_rejected" },
    "University rejected",
  )
  return { universityId: updated.id, name: updated.name }
}
