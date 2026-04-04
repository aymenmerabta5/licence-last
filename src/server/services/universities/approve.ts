import "server-only"

import { and, eq } from "drizzle-orm"
import { db } from "@/server/db"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"

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
      .where(and(eq(university.id, universityId), eq(university.status, "pending")))
      .returning({ id: university.id, name: university.name })

    if (!updated) {
      const [existing] = await tx
        .select({ id: university.id, status: university.status })
        .from(university)
        .where(eq(university.id, universityId))
        .limit(1)

      if (!existing) {
        throw new ServiceError("UNIVERSITY_NOT_FOUND", "University not found")
      }

      throw new ServiceError(
        "UNIVERSITY_INVALID_STATUS_TRANSITION",
        "Only pending universities can be approved",
      )
    }

    // Approve all pending domains
    await tx
      .update(universityDomain)
      .set({ status: "approved" })
      .where(
        and(
          eq(universityDomain.universityId, universityId),
          eq(universityDomain.status, "pending"),
        ),
      )

    log.info(
      { universityId: updated.id, event: "university_approved" },
      "University approved",
    )
    return updated
  })

  return { universityId: result.id, name: result.name }
}
