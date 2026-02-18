import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@/server/db"
import { savedOffer } from "@/server/db/schema/internships"

export async function unsaveOffer(offerId: string, userId: string) {
  const removed = await db
    .delete(savedOffer)
    .where(and(eq(savedOffer.userId, userId), eq(savedOffer.offerId, offerId)))
    .returning({ offerId: savedOffer.offerId })

  return {
    offerId,
    removed: removed.length > 0,
  }
}
