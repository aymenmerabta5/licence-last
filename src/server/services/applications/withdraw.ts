import "server-only"

import { and, eq } from "drizzle-orm"
import { db } from "@/server/db"
import { createModuleLogger } from "@/server/logging"

const log = createModuleLogger("services/applications/withdraw")

import { application } from "@/server/db/schema/applications"
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
    .select()
    .from(application)
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

  await db
    .update(application)
    .set({
      status: "withdrawn",
      pipelineStage: "rejected",
      pipelineStageUpdatedAt: new Date(),
    })
    .where(eq(application.id, applicationId))

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

  log.info(
    { applicationId, event: "application_withdrawn" },
    "Application withdrawn",
  )
  return { applicationId, newStatus: "withdrawn" as const }
}
