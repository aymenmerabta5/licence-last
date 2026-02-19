import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { company } from "@/server/db/schema/companies"
import { internshipOffer, savedOffer } from "@/server/db/schema/internships"
import { ServiceError } from "@/server/services/errors"

export async function saveOffer(offerId: string, userId: string) {
  const [offer] = await db
    .select({
      id: internshipOffer.id,
      status: internshipOffer.status,
      companyStatus: company.status,
    })
    .from(internshipOffer)
    .innerJoin(company, eq(internshipOffer.companyId, company.id))
    .where(eq(internshipOffer.id, offerId))
    .limit(1)

  if (!offer) {
    throw new ServiceError("OFFER_NOT_FOUND", "Offer not found")
  }

  if (offer.status !== "published" || offer.companyStatus !== "approved") {
    throw new ServiceError(
      "OFFER_NOT_SAVABLE",
      "Only published offers can be saved",
    )
  }

  const inserted = await db
    .insert(savedOffer)
    .values({ userId, offerId })
    .onConflictDoNothing()
    .returning({ offerId: savedOffer.offerId })

  return {
    offerId,
    saved: inserted.length > 0,
  }
}
