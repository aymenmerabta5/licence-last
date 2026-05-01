import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { interview } from "@/server/db/schema/interviews"
import { createModuleLogger } from "@/server/logging"
import { appendTimelineEvent } from "@/server/services/applications/pipeline"
import { InterviewServiceError } from "@/server/services/interviews/errors"
import { createNotification } from "@/server/services/notifications/create"

const log = createModuleLogger("services/interviews/cancel")

interface CancelInterviewInput {
  interviewId: string
  companyId: string
  actionByUserId: string
  actorRole: string
  reason?: string
}

export async function cancelInterview(input: CancelInterviewInput) {
  const result = await db.transaction(async (tx) => {
    const [interviewRow] = await tx
      .select({
        id: interview.id,
        status: interview.status,
        companyId: interview.companyId,
        studentUserId: interview.studentUserId,
        applicationId: interview.applicationId,
        offerId: interview.offerId,
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

    if (
      interviewRow.companyId !== input.companyId &&
      input.actorRole !== "super_admin"
    ) {
      throw new InterviewServiceError(
        "INTERVIEW_FORBIDDEN",
        "You do not have access to this interview",
      )
    }

    if (
      interviewRow.status !== "pending_confirmation" &&
      interviewRow.status !== "confirmed"
    ) {
      throw new InterviewServiceError(
        "INTERVIEW_INVALID_STATUS",
        "Interview can only be cancelled when pending or confirmed",
      )
    }

    await tx
      .update(interview)
      .set({ status: "cancelled" })
      .where(eq(interview.id, input.interviewId))

    return {
      interviewId: interviewRow.id,
      studentUserId: interviewRow.studentUserId,
      applicationId: interviewRow.applicationId,
      offerId: interviewRow.offerId,
      previousStatus: interviewRow.status,
    }
  })

  const normalizedReason = input.reason?.trim() || null

  try {
    await appendTimelineEvent({
      applicationId: result.applicationId,
      actorUserId: input.actionByUserId,
      eventType: "interview_cancelled",
      payload: {
        interviewId: result.interviewId,
        reason: normalizedReason,
        previousStatus: result.previousStatus,
      },
    })
  } catch (error) {
    log.warn(
      { error, interviewId: result.interviewId },
      "Failed to append interview cancellation timeline event",
    )
  }

  try {
    await createNotification({
      userId: result.studentUserId,
      type: "interview_cancelled",
      payload: {
        interviewId: result.interviewId,
        applicationId: result.applicationId,
        offerId: result.offerId,
        reason: normalizedReason,
      },
    })
  } catch (error) {
    log.warn(
      { error, interviewId: result.interviewId },
      "Failed to notify student about interview cancellation",
    )
  }

  return { success: true, interviewId: result.interviewId }
}
