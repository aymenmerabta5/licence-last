import "server-only"

import { eq, and } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
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
    throw new Error("Application not found")
  }

  if (app.status !== "applied") {
    throw new Error("Only pending applications can be withdrawn")
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

  return { applicationId, newStatus: "withdrawn" as const }
}
