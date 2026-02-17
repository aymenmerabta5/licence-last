import "server-only"

import { eq } from "drizzle-orm"

import { createModuleLogger } from "@/server/logging"
import { db } from "@/server/db"

const log = createModuleLogger("services/universities/approve")
import { university, universityDomain } from "@/server/db/schema/universities"

/**
 * Approve a university application.
 * Also approves all pending domains so students can register.
 */
export async function approveUniversity(
  universityId: string,
  approvedByUserId: string,
) {
  log.info({ universityId, approvedByUserId }, "Approving university")

  const result = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(university)
      .set({
        status: "approved",
        approvedAt: new Date(),
        approvedByUserId,
        rejectionReason: null,
      })
      .where(eq(university.id, universityId))
      .returning({ id: university.id, name: university.name })

    if (!updated) {
      throw new Error("University not found")
    }

    // Approve all pending domains
    await tx
      .update(universityDomain)
      .set({ status: "approved" })
      .where(eq(universityDomain.universityId, universityId))

    log.info({ universityId: updated.id, event: "university_approved" }, "University approved")
    return updated
  })

  return { universityId: result.id, name: result.name }
}
