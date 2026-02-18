import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@/server/db"
import { interview, interviewSlot } from "@/server/db/schema/interviews"
import { InterviewServiceError } from "@/server/services/interviews/errors"

export async function confirmInterviewSlot(
  interviewId: string,
  slotId: string,
  studentUserId: string,
) {
  return db.transaction(async (tx) => {
    const [interviewRow] = await tx
      .select({
        id: interview.id,
        studentUserId: interview.studentUserId,
        status: interview.status,
      })
      .from(interview)
      .where(eq(interview.id, interviewId))
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
    }
  })
}
