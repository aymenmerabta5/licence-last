import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@/server/db"
import { internshipOffer } from "@/server/db/schema/internships"

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
    throw new Error("Offer not found or access denied")
  }

  if (existing.status === "draft") {
    await db.delete(internshipOffer).where(eq(internshipOffer.id, offerId))
    return { offerId, deleted: true }
  }

  // Published or closed → soft close
  await db
    .update(internshipOffer)
    .set({ status: "closed", closesAt: new Date() })
    .where(eq(internshipOffer.id, offerId))

  return { offerId, deleted: false }
}
