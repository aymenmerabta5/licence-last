import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { internshipOffer } from "@/server/db/schema/internships"
import { offerMessage, offerMessageThread } from "@/server/db/schema/messages"
import { MessageServiceError } from "@/server/services/messages/errors"

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

  return db.transaction(async (tx) => {
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
}
