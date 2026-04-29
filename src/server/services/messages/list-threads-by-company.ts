import "server-only"

import { and, desc, eq, inArray, sql } from "drizzle-orm"

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

  const threadIds = rows.map((r) => r.id)

  const [lastMessagesResult, readStates] =
    threadIds.length > 0
      ? await Promise.all([
          db.execute<{
            id: string
            sender_user_id: string
            thread_id: string
          }>(
            sql`
              WITH ranked_messages AS (
                SELECT
                  ${offerMessage.id} AS id,
                  ${offerMessage.senderUserId} AS sender_user_id,
                  ${offerMessage.threadId} AS thread_id,
                  ROW_NUMBER() OVER (
                    PARTITION BY ${offerMessage.threadId}
                    ORDER BY ${desc(offerMessage.createdAt)}, ${desc(offerMessage.id)}
                  ) AS rn
                FROM ${offerMessage}
                WHERE ${inArray(offerMessage.threadId, threadIds)}
              )
              SELECT id, sender_user_id, thread_id
              FROM ranked_messages
              WHERE rn = 1
            `,
          ),
          db
            .select({
              threadId: offerMessageReadState.threadId,
              lastReadMessageId: offerMessageReadState.lastReadMessageId,
            })
            .from(offerMessageReadState)
            .where(
              and(
                inArray(offerMessageReadState.threadId, threadIds),
                eq(offerMessageReadState.userId, viewerUserId),
              ),
            ),
        ])
      : [[], []]

  const lastMessageByThread = new Map<
    string,
    { id: string; senderUserId: string }
  >()
  for (const msg of lastMessagesResult) {
    lastMessageByThread.set(msg.thread_id, {
      id: msg.id,
      senderUserId: msg.sender_user_id,
    })
  }

  const readStateByThread = new Map<string, string | null>()
  for (const rs of readStates) {
    readStateByThread.set(rs.threadId, rs.lastReadMessageId)
  }

  return rows.map((thread) => {
    const lastMessage = lastMessageByThread.get(thread.id)
    const lastReadMessageId = readStateByThread.get(thread.id) ?? null
    const lastMessageId = lastMessage?.id ?? null
    const lastMessageSenderUserId = lastMessage?.senderUserId ?? null

    const hasUnread =
      lastMessageId != null &&
      lastMessageSenderUserId !== viewerUserId &&
      lastReadMessageId !== lastMessageId

    return {
      ...thread,
      hasUnread,
      unreadCount: hasUnread ? 1 : 0,
    }
  })
}
