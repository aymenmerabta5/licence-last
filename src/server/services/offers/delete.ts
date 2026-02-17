import "server-only"

import { and, eq } from "drizzle-orm"

import { createModuleLogger } from "@/server/logging"
import { db } from "@/server/db"
import { internshipOffer } from "@/server/db/schema/internships"
import { ServiceError } from "@/server/services/errors"

const log = createModuleLogger("services/offers/delete")

/**
 * Delete an internship offer.
 * - Draft offers: hard delete (cascade deletes skills via FK)
 * - Published offers: soft-close (status → "closed", set closesAt)
 */
export async function deleteOffer(offerId: string, companyId: string) {
  const [existing] = await db
    .select({
      id: internshipOffer.id,
      companyId: internshipOffer.companyId,
      status: internshipOffer.status,
    })
    .from(internshipOffer)
    .where(and(eq(internshipOffer.id, offerId), eq(internshipOffer.companyId, companyId)))
    .limit(1)

  if (!existing) {
    throw new ServiceError("OFFER_NOT_FOUND", "Offer not found or access denied")
  }

  log.info({ offerId, companyId, status: existing.status }, "Deleting offer")

  if (existing.status === "draft") {
    await db.delete(internshipOffer).where(eq(internshipOffer.id, offerId))
    log.info({ offerId, event: "offer_hard_deleted" }, "Draft offer deleted")
    return { offerId, deleted: true }
  }

  // Published or closed → soft close
  await db
    .update(internshipOffer)
    .set({ status: "closed", closesAt: new Date() })
    .where(eq(internshipOffer.id, offerId))

  log.info({ offerId, event: "offer_soft_closed" }, "Published offer soft-closed")
  return { offerId, deleted: false }
}
