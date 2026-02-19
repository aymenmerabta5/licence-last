import "server-only"

import { and, asc, eq } from "drizzle-orm"

import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import {
  offerMessage,
  offerMessageReadState,
  offerMessageThread,
} from "@/server/db/schema/messages"
import { MessageServiceError } from "@/server/services/messages/errors"

export interface MessageThreadViewer {
  userId: string
  role: "student" | "company_admin"
  companyId?: string
}

export async function listThreadMessages(
  threadId: string,
  viewer: MessageThreadViewer,
) {
  const [thread] = await db
    .select({
      id: offerMessageThread.id,
      offerId: offerMessageThread.offerId,
      companyId: offerMessageThread.companyId,
      studentUserId: offerMessageThread.studentUserId,
      lastMessageAt: offerMessageThread.lastMessageAt,
      createdAt: offerMessageThread.createdAt,
    })
    .from(offerMessageThread)
    .where(eq(offerMessageThread.id, threadId))
    .limit(1)

  if (!thread) {
    throw new MessageServiceError(
      "THREAD_NOT_FOUND",
      "Message thread not found",
    )
  }

  if (viewer.role === "student" && thread.studentUserId !== viewer.userId) {
    throw new MessageServiceError(
      "THREAD_FORBIDDEN",
      "You do not have access to this thread",
    )
  }

  if (
    viewer.role === "company_admin" &&
    (!viewer.companyId || thread.companyId !== viewer.companyId)
  ) {
    throw new MessageServiceError(
      "THREAD_FORBIDDEN",
      "You do not have access to this thread",
    )
  }

  const messages = await db
    .select({
      id: offerMessage.id,
      senderUserId: offerMessage.senderUserId,
      body: offerMessage.body,
      createdAt: offerMessage.createdAt,
      senderName: user.name,
      senderImage: user.image,
    })
    .from(offerMessage)
    .innerJoin(user, eq(offerMessage.senderUserId, user.id))
    .where(eq(offerMessage.threadId, threadId))
    .orderBy(asc(offerMessage.createdAt), asc(offerMessage.id))

  const [readState] = await db
    .select({
      lastReadMessageId: offerMessageReadState.lastReadMessageId,
      lastReadAt: offerMessageReadState.lastReadAt,
    })
    .from(offerMessageReadState)
    .where(
      and(
        eq(offerMessageReadState.threadId, threadId),
        eq(offerMessageReadState.userId, viewer.userId),
      ),
    )
    .limit(1)

  return {
    thread,
    messages,
    readState: readState ?? null,
  }
}
