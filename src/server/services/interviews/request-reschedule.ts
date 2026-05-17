import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { companyMember } from "@/server/db/schema/companies"
import { interview, interviewSlot } from "@/server/db/schema/interviews"
import { createModuleLogger } from "@/server/logging"
import { InterviewServiceError } from "@/server/services/interviews/errors"
import { createNotification } from "@/server/services/notifications/create"

const log = createModuleLogger("services/interviews/request-reschedule")

interface RequestRescheduleInput {
  interviewId: string
  reason?: string
  proposedSlots: Array<{
    startsAt: Date
    endsAt: Date
  }>
}

export async function requestInterviewReschedule(
  input: RequestRescheduleInput,
  studentUserId: string,
) {
  if (input.proposedSlots.length === 0) {
    throw new InterviewServiceError(
      "INTERVIEW_SLOT_INVALID",
      "At least one proposed slot is required",
    )
  }

  for (const slot of input.proposedSlots) {
    if (slot.startsAt >= slot.endsAt) {
      throw new InterviewServiceError(
        "INTERVIEW_SLOT_INVALID",
        "Each slot start time must be before end time",
      )
    }
    if (slot.startsAt <= new Date()) {
      throw new InterviewServiceError(
        "INTERVIEW_SLOT_INVALID",
        "Proposed slots must be in the future",
      )
    }
  }

  const result = await db.transaction(async (tx) => {
    const [interviewRow] = await tx
      .select({
        id: interview.id,
        studentUserId: interview.studentUserId,
        companyId: interview.companyId,
        offerId: interview.offerId,
        status: interview.status,
      })
      .from(interview)
      .where(eq(interview.id, input.interviewId))
      .for("update")
      .limit(1)

    if (!interviewRow) {
      throw new InterviewServiceError("INTERVIEW_NOT_FOUND", "Interview not found")
    }

    if (interviewRow.studentUserId !== studentUserId) {
      throw new InterviewServiceError(
        "INTERVIEW_FORBIDDEN",
        "You do not have access to this interview",
      )
    }

    if (interviewRow.status === "cancelled" || interviewRow.status === "completed") {
      throw new InterviewServiceError(
        "INTERVIEW_INVALID_STATUS",
        "Interview cannot be rescheduled in its current state",
      )
    }

    await tx
      .delete(interviewSlot)
      .where(eq(interviewSlot.interviewId, input.interviewId))

    await tx.insert(interviewSlot).values(
      input.proposedSlots.map((slot) => ({
        id: crypto.randomUUID(),
        interviewId: input.interviewId,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
        location: null,
        meetingUrl: null,
      })),
    )

    await tx
      .update(interview)
      .set({
        status: "reschedule_requested",
        confirmedSlotId: null,
        confirmedByUserId: null,
        confirmedAt: null,
        rescheduleNote: input.reason?.trim() ? input.reason.trim() : null,
        rescheduleRequestedAt: new Date(),
        rescheduleRequestedByUserId: studentUserId,
      })
      .where(eq(interview.id, input.interviewId))

    return {
      interviewId: input.interviewId,
      companyId: interviewRow.companyId,
      offerId: interviewRow.offerId,
    }
  })

  try {
    const members = await db
      .select({ userId: companyMember.userId })
      .from(companyMember)
      .where(eq(companyMember.companyId, result.companyId))

    if (members.length > 0) {
      const notificationResults = await Promise.allSettled(
        members.map((member) =>
          createNotification({
            userId: member.userId,
            type: "interview_reschedule_requested",
            payload: {
              interviewId: result.interviewId,
              offerId: result.offerId,
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
            interviewId: result.interviewId,
            failedCount,
            memberCount: members.length,
          },
          "Failed to notify some company members about reschedule request",
        )
      }
    }
  } catch (error) {
    log.warn({ error, interviewId: result.interviewId }, "Failed to notify company")
  }

  return { interviewId: result.interviewId }
}
