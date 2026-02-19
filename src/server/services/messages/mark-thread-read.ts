import "server-only"

import { desc, eq } from "drizzle-orm"

import { db } from "@/server/db"
import {
  offerMessage,
  offerMessageReadState,
  offerMessageThread,
} from "@/server/db/schema/messages"
import { MessageServiceError } from "@/server/services/messages/errors"
import type { MessageThreadViewer } from "@/server/services/messages/list-thread-messages"

function assertThreadAccess(
  thread: {
    id: string
    companyId: string
    studentUserId: string
  },
  viewer: MessageThreadViewer,
) {
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
}

export async function markThreadRead(
  threadId: string,
  viewer: MessageThreadViewer,
) {
  const [thread] = await db
    .select({
      id: offerMessageThread.id,
      companyId: offerMessageThread.companyId,
      studentUserId: offerMessageThread.studentUserId,
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

  assertThreadAccess(thread, viewer)

  const [lastMessage] = await db
    .select({
      id: offerMessage.id,
      createdAt: offerMessage.createdAt,
    })
    .from(offerMessage)
    .where(eq(offerMessage.threadId, threadId))
    .orderBy(desc(offerMessage.createdAt), desc(offerMessage.id))
    .limit(1)

  if (!lastMessage) {
    return { threadId, marked: false }
  }

  const now = new Date()

  await db
    .insert(offerMessageReadState)
    .values({
      threadId,
      userId: viewer.userId,
      lastReadMessageId: lastMessage.id,
      lastReadAt: now,
    })
    .onConflictDoUpdate({
      target: [offerMessageReadState.threadId, offerMessageReadState.userId],
      set: {
        lastReadMessageId: lastMessage.id,
        lastReadAt: now,
        updatedAt: now,
      },
    })

  return { threadId, marked: true }
}
