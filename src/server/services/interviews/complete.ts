import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { interview } from "@/server/db/schema/interviews"
import { createModuleLogger } from "@/server/logging"
import { appendTimelineEvent } from "@/server/services/applications/pipeline"
import { InterviewServiceError } from "@/server/services/interviews/errors"
import { createNotification } from "@/server/services/notifications/create"

const log = createModuleLogger("services/interviews/complete")

export async function completeInterview(
  interviewId: string,
  companyId: string,
  actionByUserId: string,
) {
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
      .where(eq(interview.id, interviewId))
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

    if (interviewRow.status !== "confirmed") {
      throw new InterviewServiceError(
        "INTERVIEW_INVALID_STATUS",
        "Interview must be confirmed before it can be completed",
      )
    }

    await tx
      .update(interview)
      .set({ status: "completed" })
      .where(eq(interview.id, interviewId))

    return {
      interviewId: interviewRow.id,
      studentUserId: interviewRow.studentUserId,
      applicationId: interviewRow.applicationId,
      offerId: interviewRow.offerId,
    }
  })

  try {
    await appendTimelineEvent({
      applicationId: result.applicationId,
      actorUserId: actionByUserId,
      eventType: "interview_completed",
      payload: { interviewId: result.interviewId },
    })
  } catch (error) {
    log.warn(
      { error, interviewId: result.interviewId },
      "Failed to append interview completion timeline event",
    )
  }

  try {
    await createNotification({
      userId: result.studentUserId,
      type: "interview_completed",
      payload: {
        interviewId: result.interviewId,
        applicationId: result.applicationId,
        offerId: result.offerId,
      },
    })
  } catch (error) {
    log.warn(
      { error, interviewId: result.interviewId },
      "Failed to notify student about interview completion",
    )
  }

  return { success: true, interviewId: result.interviewId }
}
