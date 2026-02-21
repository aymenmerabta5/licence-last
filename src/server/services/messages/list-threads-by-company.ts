import "server-only"

import { and, desc, eq, sql } from "drizzle-orm"

import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { internshipOffer } from "@/server/db/schema/internships"
import {
  offerMessage,
  offerMessageReadState,
  offerMessageThread,
} from "@/server/db/schema/messages"
import { MessageServiceError } from "@/server/services/messages/errors"

interface ListCompanyMessageThreadsParams {
  offerId?: string
  limit?: number
}

export async function listMessageThreadsByCompany(
  companyId: string,
  viewerUserId: string,
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

  const rows = await db
    .select({
      id: offerMessageThread.id,
      offerId: offerMessageThread.offerId,
      offerTitle: internshipOffer.title,
      studentUserId: offerMessageThread.studentUserId,
      studentName: user.name,
      studentImage: user.image,
      lastMessageAt: offerMessageThread.lastMessageAt,
      createdAt: offerMessageThread.createdAt,
      lastMessageId: sql<string | null>`(
        select ${offerMessage.id}
        from ${offerMessage}
        where ${offerMessage.threadId} = ${offerMessageThread.id}
        order by ${offerMessage.createdAt} desc, ${offerMessage.id} desc
        limit 1
      )`,
      lastMessageSenderUserId: sql<string | null>`(
        select ${offerMessage.senderUserId}
        from ${offerMessage}
        where ${offerMessage.threadId} = ${offerMessageThread.id}
        order by ${offerMessage.createdAt} desc, ${offerMessage.id} desc
        limit 1
      )`,
      lastReadMessageId: sql<string | null>`(
        select ${offerMessageReadState.lastReadMessageId}
        from ${offerMessageReadState}
        where ${offerMessageReadState.threadId} = ${offerMessageThread.id}
          and ${offerMessageReadState.userId} = ${viewerUserId}
        limit 1
      )`,
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

  return rows.map(
    ({ lastMessageId, lastMessageSenderUserId, lastReadMessageId, ...thread }) => {
      const hasUnread =
        lastMessageId != null &&
        lastMessageSenderUserId !== viewerUserId &&
        lastReadMessageId !== lastMessageId

      return {
        ...thread,
        hasUnread,
        unreadCount: hasUnread ? 1 : 0,
      }
    },
  )
}
