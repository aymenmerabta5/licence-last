import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { companyMember } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"
import { offerMessage, offerMessageThread } from "@/server/db/schema/messages"
import { createModuleLogger } from "@/server/logging"
import { MessageServiceError } from "@/server/services/messages/errors"
import { createNotification } from "@/server/services/notifications/create"

const log = createModuleLogger("services/messages/send-by-student")

interface SendOfferMessageByStudentInput {
  offerId: string
  body: string
}

export async function sendOfferMessageByStudent(
  input: SendOfferMessageByStudentInput,
  studentUserId: string,
) {
  const body = input.body.trim()
  if (!body) {
    throw new MessageServiceError(
      "MESSAGE_EMPTY",
      "Message body cannot be empty",
    )
  }

  const [offer] = await db
    .select({
      id: internshipOffer.id,
      companyId: internshipOffer.companyId,
      title: internshipOffer.title,
    })
    .from(internshipOffer)
    .where(eq(internshipOffer.id, input.offerId))
    .limit(1)

  if (!offer) {
    throw new MessageServiceError("OFFER_NOT_FOUND", "Offer not found")
  }

  const [applicationRow] = await db
    .select({ id: application.id })
    .from(application)
    .where(
      and(
        eq(application.offerId, input.offerId),
        eq(application.studentUserId, studentUserId),
      ),
    )
    .limit(1)

  if (!applicationRow) {
    throw new MessageServiceError(
      "APPLICATION_NOT_FOUND",
      "You cannot message this company for the selected offer",
    )
  }

  const now = new Date()

  const result = await db.transaction(async (tx) => {
    const [thread] = await tx
      .insert(offerMessageThread)
      .values({
        id: crypto.randomUUID(),
        offerId: input.offerId,
        companyId: offer.companyId,
        studentUserId,
        createdByUserId: studentUserId,
        lastMessageAt: now,
      })
      .onConflictDoUpdate({
        target: [offerMessageThread.offerId, offerMessageThread.studentUserId],
        set: {
          lastMessageAt: now,
          updatedAt: now,
        },
      })
      .returning({
        id: offerMessageThread.id,
      })

    const messageId = crypto.randomUUID()
    await tx.insert(offerMessage).values({
      id: messageId,
      threadId: thread.id,
      offerId: input.offerId,
      senderUserId: studentUserId,
      body,
    })

    return {
      threadId: thread.id,
      messageId,
    }
  })

  try {
    const members = await db
      .select({ userId: companyMember.userId })
      .from(companyMember)
      .where(eq(companyMember.companyId, offer.companyId))

    if (members.length > 0) {
      const notificationResults = await Promise.allSettled(
        members.map((member) =>
          createNotification({
            userId: member.userId,
            type: "new_message",
            payload: {
              offerId: input.offerId,
              offerTitle: offer.title,
              threadId: result.threadId,
              messageId: result.messageId,
              senderRole: "student",
              senderUserId: studentUserId,
            },
          }),
        ),
      )

      const failedCount = notificationResults.filter(
        (item) => item.status === "rejected",
      ).length

      if (failedCount > 0) {
        log.warn(
          {
            offerId: input.offerId,
            threadId: result.threadId,
            failedCount,
            memberCount: members.length,
          },
          "Failed to notify some company members about new student message",
        )
      }
    }
  } catch (error) {
    log.warn(
      { error, offerId: input.offerId, threadId: result.threadId },
      "Failed to dispatch company notifications for student message",
    )
  }

  return result
}
