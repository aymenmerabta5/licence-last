import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@/server/db"
import { companyMember } from "@/server/db/schema/companies"
import { interview, interviewSlot } from "@/server/db/schema/interviews"
import { createModuleLogger } from "@/server/logging"
import { InterviewServiceError } from "@/server/services/interviews/errors"
import { createNotification } from "@/server/services/notifications/create"

const log = createModuleLogger("services/interviews/confirm")

export async function confirmInterviewSlot(
  interviewId: string,
  slotId: string,
  studentUserId: string,
) {
  const confirmation = await db.transaction(async (tx) => {
    const [interviewRow] = await tx
      .select({
        id: interview.id,
        studentUserId: interview.studentUserId,
        companyId: interview.companyId,
        offerId: interview.offerId,
        status: interview.status,
      })
      .from(interview)
      .where(eq(interview.id, interviewId))
      .for("update")
      .limit(1)

    if (!interviewRow) {
      throw new InterviewServiceError(
        "INTERVIEW_NOT_FOUND",
        "Interview not found",
      )
    }

    if (interviewRow.studentUserId !== studentUserId) {
      throw new InterviewServiceError(
        "INTERVIEW_FORBIDDEN",
        "You do not have access to this interview",
      )
    }

    if (interviewRow.status === "confirmed") {
      throw new InterviewServiceError(
        "INTERVIEW_ALREADY_CONFIRMED",
        "Interview is already confirmed",
      )
    }

    if (interviewRow.status === "cancelled") {
      throw new InterviewServiceError(
        "INTERVIEW_FORBIDDEN",
        "Cancelled interviews cannot be confirmed",
      )
    }

    const [slot] = await tx
      .select({
        id: interviewSlot.id,
        startsAt: interviewSlot.startsAt,
        endsAt: interviewSlot.endsAt,
      })
      .from(interviewSlot)
      .where(
        and(
          eq(interviewSlot.id, slotId),
          eq(interviewSlot.interviewId, interviewId),
        ),
      )
      .limit(1)

    if (!slot) {
      throw new InterviewServiceError(
        "INTERVIEW_SLOT_NOT_FOUND",
        "Interview slot not found",
      )
    }

    await tx
      .update(interview)
      .set({
        status: "confirmed",
        confirmedSlotId: slot.id,
        confirmedByUserId: studentUserId,
        confirmedAt: new Date(),
      })
      .where(eq(interview.id, interviewId))

    return {
      interviewId,
      confirmedSlotId: slot.id,
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      companyId: interviewRow.companyId,
      offerId: interviewRow.offerId,
    }
  })

  try {
    const members = await db
      .select({ userId: companyMember.userId })
      .from(companyMember)
      .where(eq(companyMember.companyId, confirmation.companyId))

    if (members.length > 0) {
      const notificationResults = await Promise.allSettled(
        members.map((member) =>
          createNotification({
            userId: member.userId,
            type: "interview_confirmed",
            payload: {
              interviewId: confirmation.interviewId,
              slotId: confirmation.confirmedSlotId,
              offerId: confirmation.offerId,
              studentUserId,
              startsAt: confirmation.startsAt.toISOString(),
              endsAt: confirmation.endsAt.toISOString(),
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
            interviewId: confirmation.interviewId,
            failedCount,
            memberCount: members.length,
          },
          "Failed to notify some company members about interview confirmation",
        )
      }
    }
  } catch (error) {
    log.warn(
      { error, interviewId: confirmation.interviewId },
      "Failed to dispatch company notifications for interview confirmation",
    )
  }

  return {
    interviewId: confirmation.interviewId,
    confirmedSlotId: confirmation.confirmedSlotId,
    startsAt: confirmation.startsAt,
    endsAt: confirmation.endsAt,
  }
}
