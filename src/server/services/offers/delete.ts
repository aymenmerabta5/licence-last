import "server-only"

import { and, eq } from "drizzle-orm"
import { db } from "@/server/db"
import { internshipOffer } from "@/server/db/schema/internships"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"

const log = createModuleLogger("services/offers/delete")

/**
 * Delete an internship offer.
 * - Draft offers: hard delete (cascade deletes skills via FK)
 * - Published offers: must be closed via the dedicated owner-only action
 */
export async function deleteOffer(offerId: string, companyId: string) {
  const result = await db.transaction(async (tx) => {
    const [deletedDraft] = await tx
      .delete(internshipOffer)
      .where(
        and(
          eq(internshipOffer.id, offerId),
          eq(internshipOffer.companyId, companyId),
          eq(internshipOffer.status, "draft"),
        ),
      )
      .returning({ id: internshipOffer.id, status: internshipOffer.status })

    if (deletedDraft) {
      return { offerId, deleted: true, status: "draft" as const }
    }

    const [existing] = await tx
      .select({
        status: internshipOffer.status,
      })
      .from(internshipOffer)
      .where(
        and(
          eq(internshipOffer.id, offerId),
          eq(internshipOffer.companyId, companyId),
        ),
      )
      .limit(1)

    if (!existing) {
      throw new ServiceError(
        "OFFER_NOT_FOUND",
        "Offer not found or access denied",
      )
    }

    if (existing.status === "published") {
      throw new ServiceError(
        "OFFER_PUBLISHED_DELETE_FORBIDDEN",
        "Published offers must be closed instead of deleted",
      )
    }

    return { offerId, deleted: false, status: existing.status }
  })

  log.info({ offerId, companyId, status: result.status }, "Deleting offer")

  if (result.deleted) {
    log.info({ offerId, event: "offer_hard_deleted" }, "Draft offer deleted")
    return { offerId, deleted: true }
  }

  return { offerId, deleted: false }
}
