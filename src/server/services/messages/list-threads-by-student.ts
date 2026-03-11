import "server-only"

import { desc, eq, sql } from "drizzle-orm"

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
          and ${offerMessageReadState.userId} = ${studentUserId}
        limit 1
      )`,
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

  return rows.map(
    ({
      lastMessageId,
      lastMessageSenderUserId,
      lastReadMessageId,
      ...thread
    }) => {
      const hasUnread =
        lastMessageId != null &&
        lastMessageSenderUserId !== studentUserId &&
        lastReadMessageId !== lastMessageId

      return {
        ...thread,
        hasUnread,
        unreadCount: hasUnread ? 1 : 0,
      }
    },
  )
}
