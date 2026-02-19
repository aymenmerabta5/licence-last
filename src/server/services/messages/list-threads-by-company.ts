import "server-only"

import { and, desc, eq } from "drizzle-orm"

import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { internshipOffer } from "@/server/db/schema/internships"
import { offerMessageThread } from "@/server/db/schema/messages"
import { MessageServiceError } from "@/server/services/messages/errors"

interface ListCompanyMessageThreadsParams {
  offerId?: string
  limit?: number
}

export async function listMessageThreadsByCompany(
  companyId: string,
  params: ListCompanyMessageThreadsParams = {},
) {
  const { offerId, limit = 30 } = params

  if (offerId) {
    const [offer] = await db
      .select({
        id: internshipOffer.id,
        companyId: internshipOffer.companyId,
      })
      .from(internshipOffer)
      .where(eq(internshipOffer.id, offerId))
      .limit(1)

    if (!offer) {
      throw new MessageServiceError("OFFER_NOT_FOUND", "Offer not found")
    }

    if (offer.companyId !== companyId) {
      throw new MessageServiceError(
        "OFFER_FORBIDDEN",
        "You do not have access to this offer",
      )
    }
  }

  const conditions = [eq(offerMessageThread.companyId, companyId)]
  if (offerId) {
    conditions.push(eq(offerMessageThread.offerId, offerId))
  }

  return db
    .select({
      id: offerMessageThread.id,
      offerId: offerMessageThread.offerId,
      offerTitle: internshipOffer.title,
      studentUserId: offerMessageThread.studentUserId,
      studentName: user.name,
      studentImage: user.image,
      lastMessageAt: offerMessageThread.lastMessageAt,
      createdAt: offerMessageThread.createdAt,
    })
    .from(offerMessageThread)
    .innerJoin(
      internshipOffer,
      eq(offerMessageThread.offerId, internshipOffer.id),
    )
    .innerJoin(user, eq(offerMessageThread.studentUserId, user.id))
    .where(and(...conditions))
    .orderBy(
      desc(offerMessageThread.lastMessageAt),
      desc(offerMessageThread.id),
    )
    .limit(limit)
}
