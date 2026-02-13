import "server-only"

import { eq } from "drizzle-orm"

import { createModuleLogger } from "@/server/logging"
import { db } from "@/server/db"

const log = createModuleLogger("services/universities/reject")
import { university } from "@/server/db/schema/universities"

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
    .where(eq(university.id, universityId))
    .returning({ id: university.id, name: university.name })

  if (!updated) {
    throw new Error("University not found")
  }

  log.info({ universityId: updated.id, event: "university_rejected" }, "University rejected")
  return { universityId: updated.id, name: updated.name }
}
