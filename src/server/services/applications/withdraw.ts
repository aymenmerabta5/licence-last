import "server-only"

import { and, eq } from "drizzle-orm"
import { db } from "@/server/db"
import { createModuleLogger } from "@/server/logging"

const log = createModuleLogger("services/applications/withdraw")

import { application } from "@/server/db/schema/applications"
import { internshipOffer } from "@/server/db/schema/internships"
import { ApplicationServiceError } from "@/server/services/applications/errors"
import { appendTimelineEvent } from "@/server/services/applications/pipeline"

/**
 * Withdraw an application.
 * Only allowed if status is "applied" (before company/admin action).
 */
export async function withdrawApplication(
  applicationId: string,
  studentUserId: string,
) {
  const [app] = await db
    .select({
      id: application.id,
      studentUserId: application.studentUserId,
      status: application.status,
      pipelineStage: application.pipelineStage,
      offerId: application.offerId,
      companyId: internshipOffer.companyId,
    })
    .from(application)
    .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
    .where(
      and(
        eq(application.id, applicationId),
        eq(application.studentUserId, studentUserId),
      ),
    )
    .limit(1)

  if (!app) {
    throw new ApplicationServiceError(
      "APPLICATION_NOT_FOUND",
      "Application not found",
    )
  }

  log.info({ applicationId, studentUserId }, "Withdrawing application")

  if (app.status !== "applied") {
    throw new ApplicationServiceError(
      "APPLICATION_INVALID_STATE",
      "Only pending applications can be withdrawn",
    )
  }

  const [updatedApplication] = await db
    .update(application)
    .set({
      status: "withdrawn",
      pipelineStage: "rejected",
      pipelineStageUpdatedAt: new Date(),
    })
    .where(and(eq(application.id, applicationId), eq(application.status, app.status)))
    .returning({ id: application.id })

  if (!updatedApplication) {
    throw new ApplicationServiceError(
      "APPLICATION_INVALID_STATE",
      "Application was changed by another action. Refresh and try again.",
    )
  }

  try {
    await appendTimelineEvent({
      applicationId,
      actorUserId: studentUserId,
      eventType: "application_status_changed",
      fromStage: app.pipelineStage,
      toStage: "rejected",
      fromStatus: app.status,
      toStatus: "withdrawn",
      payload: { reason: "withdrawn_by_student" },
    })
  } catch (error) {
    log.error(
      { err: error, applicationId },
      "Failed to append withdrawal timeline event",
    )
  }

  log.info(
    { applicationId, event: "application_withdrawn" },
    "Application withdrawn",
  )
  return {
    applicationId,
    newStatus: "withdrawn" as const,
    companyId: app.companyId,
  }
}
