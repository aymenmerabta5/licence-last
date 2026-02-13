import "server-only"

import { and, eq } from "drizzle-orm"

import { createModuleLogger } from "@/server/logging"
import { db } from "@/server/db"
import { internshipOffer } from "@/server/db/schema/internships"

const log = createModuleLogger("services/offers/update-status")

/**
 * Transition an offer's status.
 * Valid transitions: draft → published, published → closed.
 */
export async function updateOfferStatus(
  offerId: string,
  companyId: string,
  action: "publish" | "close",
) {
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
    throw new Error("Offer not found or access denied")
  }

  log.info({ offerId, companyId, action, currentStatus: existing.status }, "Updating offer status")

  if (action === "publish") {
    if (existing.status !== "draft") {
      throw new Error("Only draft offers can be published")
    }
    await db
      .update(internshipOffer)
      .set({ status: "published", publishedAt: new Date() })
      .where(eq(internshipOffer.id, offerId))

    log.info({ offerId, event: "offer_published" }, "Offer published")
    return { offerId, newStatus: "published" as const }
  }

  if (action === "close") {
    if (existing.status !== "published") {
      throw new Error("Only published offers can be closed")
    }
    await db
      .update(internshipOffer)
      .set({ status: "closed", closesAt: new Date() })
      .where(eq(internshipOffer.id, offerId))

    log.info({ offerId, event: "offer_closed" }, "Offer closed")
    return { offerId, newStatus: "closed" as const }
  }

  throw new Error(`Invalid action: ${action}`)
}
