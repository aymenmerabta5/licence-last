import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { interview, interviewSlot } from "@/server/db/schema/interviews"
import { createModuleLogger } from "@/server/logging"
import { InterviewServiceError } from "@/server/services/interviews/errors"
import { createNotification } from "@/server/services/notifications/create"

const log = createModuleLogger("services/interviews/reschedule")

interface RescheduleSlotInput {
  startsAt: Date
  endsAt: Date
  location?: string | null
  meetingUrl?: string | null
}

interface RescheduleInterviewInput {
  interviewId: string
  note?: string
  slots: RescheduleSlotInput[]
}

export async function rescheduleInterviewSlots(
  input: RescheduleInterviewInput,
  companyId: string,
  _actorUserId: string,
) {
  if (input.slots.length === 0) {
    throw new InterviewServiceError(
      "INTERVIEW_SLOT_INVALID",
      "At least one slot must be proposed",
    )
  }

  for (const slot of input.slots) {
    if (slot.startsAt >= slot.endsAt) {
      throw new InterviewServiceError(
        "INTERVIEW_SLOT_INVALID",
        "Each slot start time must be before end time",
      )
    }
    if (slot.startsAt <= new Date()) {
      throw new InterviewServiceError(
        "INTERVIEW_SLOT_INVALID",
        "Interview slots must be scheduled in the future",
      )
    }
  }

  const result = await db.transaction(async (tx) => {
    const [interviewRow] = await tx
      .select({
        id: interview.id,
        companyId: interview.companyId,
        studentUserId: interview.studentUserId,
        offerId: interview.offerId,
        status: interview.status,
        note: interview.note,
      })
      .from(interview)
      .where(eq(interview.id, input.interviewId))
      .for("update")
      .limit(1)

    if (!interviewRow) {
      throw new InterviewServiceError(
        "INTERVIEW_NOT_FOUND",
        "Interview not found",
      )
    }

    if (interviewRow.companyId !== companyId) {
      throw new InterviewServiceError(
        "INTERVIEW_FORBIDDEN",
        "You do not have access to this interview",
      )
    }

    if (interviewRow.status === "completed") {
      throw new InterviewServiceError(
        "INTERVIEW_INVALID_STATUS",
        "Completed interviews cannot be rescheduled",
      )
    }

    await tx
      .delete(interviewSlot)
      .where(eq(interviewSlot.interviewId, input.interviewId))

    await tx.insert(interviewSlot).values(
      input.slots.map((slot) => ({
        id: crypto.randomUUID(),
        interviewId: input.interviewId,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
        location: slot.location?.trim() ? slot.location.trim() : null,
        meetingUrl: slot.meetingUrl?.trim() ? slot.meetingUrl.trim() : null,
      })),
    )

    await tx
      .update(interview)
      .set({
        status: "pending_confirmation",
        confirmedSlotId: null,
        confirmedByUserId: null,
        confirmedAt: null,
        rescheduleNote: null,
        rescheduleRequestedAt: null,
        rescheduleRequestedByUserId: null,
        note: input.note?.trim() ? input.note.trim() : interviewRow.note,
      })
      .where(eq(interview.id, input.interviewId))

    return {
      interviewId: input.interviewId,
      studentUserId: interviewRow.studentUserId,
      offerId: interviewRow.offerId,
    }
  })

  try {
    await createNotification({
      userId: result.studentUserId,
      type: "interview_rescheduled",
      payload: {
        interviewId: result.interviewId,
        offerId: result.offerId,
      },
    })
  } catch (error) {
    log.warn(
      { error, interviewId: result.interviewId },
      "Failed to notify student",
    )
  }

  return { interviewId: result.interviewId }
}
