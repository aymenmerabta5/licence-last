import "server-only"

import { and, desc, eq, inArray, sql } from "drizzle-orm"

import { db } from "@/server/db"
import { company } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"
import {
  offerMessage,
  offerMessageReadState,
  offerMessageThread,
} from "@/server/db/schema/messages"

interface ListStudentMessageThreadsParams {
  limit?: number
}

export async function listMessageThreadsByStudent(
  studentUserId: string,
  params: ListStudentMessageThreadsParams = {},
) {
  const { limit = 30 } = params

  const rows = await db
    .select({
      id: offerMessageThread.id,
      offerId: offerMessageThread.offerId,
      offerTitle: internshipOffer.title,
      companyId: offerMessageThread.companyId,
      companyName: company.name,
      companyLogoUrl: company.logoUrl,
      lastMessageAt: offerMessageThread.lastMessageAt,
      createdAt: offerMessageThread.createdAt,
    })
    .from(offerMessageThread)
    .innerJoin(
      internshipOffer,
      eq(offerMessageThread.offerId, internshipOffer.id),
    )
    .innerJoin(company, eq(offerMessageThread.companyId, company.id))
    .where(eq(offerMessageThread.studentUserId, studentUserId))
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
                eq(offerMessageReadState.userId, studentUserId),
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
      lastMessageSenderUserId !== studentUserId &&
      lastReadMessageId !== lastMessageId

    return {
      ...thread,
      hasUnread,
      unreadCount: hasUnread ? 1 : 0,
    }
  })
}
