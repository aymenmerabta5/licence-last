import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@/server/db"
import { savedOffer } from "@/server/db/schema/internships"

export async function checkOfferSaved(offerId: string, userId: string) {
  const [row] = await db
    .select({ offerId: savedOffer.offerId })
    .from(savedOffer)
    .where(and(eq(savedOffer.userId, userId), eq(savedOffer.offerId, offerId)))
    .limit(1)

  return { saved: Boolean(row) }
}
