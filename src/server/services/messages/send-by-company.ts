import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { internshipOffer } from "@/server/db/schema/internships"
import { offerMessage, offerMessageThread } from "@/server/db/schema/messages"
import { createModuleLogger } from "@/server/logging"
import { MessageServiceError } from "@/server/services/messages/errors"
import { createNotification } from "@/server/services/notifications/create"

const log = createModuleLogger("services/messages/send-by-company")

interface SendOfferMessageByCompanyInput {
  offerId: string
  studentUserId: string
  body: string
}

export async function sendOfferMessageByCompany(
  input: SendOfferMessageByCompanyInput,
  companyId: string,
  senderUserId: string,
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

  if (offer.companyId !== companyId) {
    throw new MessageServiceError(
      "OFFER_FORBIDDEN",
      "You do not have access to this offer",
    )
  }

  const [applicationRow] = await db
    .select({ id: application.id })
    .from(application)
    .where(
      and(
        eq(application.offerId, input.offerId),
        eq(application.studentUserId, input.studentUserId),
      ),
    )
    .limit(1)

  if (!applicationRow) {
    throw new MessageServiceError(
      "APPLICATION_NOT_FOUND",
      "Student has not applied to this offer",
    )
  }

  const now = new Date()

  const result = await db.transaction(async (tx) => {
    const [thread] = await tx
      .insert(offerMessageThread)
      .values({
        id: crypto.randomUUID(),
        offerId: input.offerId,
        companyId,
        studentUserId: input.studentUserId,
        createdByUserId: senderUserId,
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
      senderUserId,
      body,
    })

    return {
      threadId: thread.id,
      messageId,
    }
  })

  try {
    await createNotification({
      userId: input.studentUserId,
      type: "new_message",
      payload: {
        offerId: input.offerId,
        offerTitle: offer.title,
        threadId: result.threadId,
        messageId: result.messageId,
        senderRole: "company",
        senderUserId,
      },
    })
  } catch (error) {
    log.warn(
      { error, offerId: input.offerId, threadId: result.threadId },
      "Failed to dispatch student notification for company message",
    )
  }

  return result
}
