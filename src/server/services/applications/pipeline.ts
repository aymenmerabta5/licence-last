import "server-only"

import { and, desc, eq } from "drizzle-orm"

import {
  canTransitionStage,
  type PipelineStage,
} from "@/lib/constants/pipeline"
import { db } from "@/server/db"
import {
  application,
  applicationTimelineEvent,
} from "@/server/db/schema/applications"
import { interview } from "@/server/db/schema/interviews"
import { internshipOffer } from "@/server/db/schema/internships"
import { createModuleLogger } from "@/server/logging"
import { ApplicationServiceError } from "@/server/services/applications/errors"
import { createNotification } from "@/server/services/notifications/create"

const log = createModuleLogger("services/applications/pipeline")

export async function appendTimelineEvent(input: {
  applicationId: string
  actorUserId?: string | null
  eventType: string
  fromStage?: PipelineStage | null
  toStage?: PipelineStage | null
  fromStatus?:
    | "applied"
    | "company_accepted"
    | "company_refused"
    | "admin_validated"
    | "admin_rejected"
    | "withdrawn"
    | null
  toStatus?:
    | "applied"
    | "company_accepted"
    | "company_refused"
    | "admin_validated"
    | "admin_rejected"
    | "withdrawn"
    | null
  payload?: Record<string, unknown>
}) {
  const eventId = crypto.randomUUID()
  await db.insert(applicationTimelineEvent).values({
    id: eventId,
    applicationId: input.applicationId,
    actorUserId: input.actorUserId ?? null,
    eventType: input.eventType,
    fromStage: input.fromStage ?? null,
    toStage: input.toStage ?? null,
    fromStatus: input.fromStatus ?? null,
    toStatus: input.toStatus ?? null,
    payload: input.payload ?? {},
  })
  return { eventId }
}

export async function listApplicationTimeline(applicationId: string) {
  const rows = await db
    .select({
      id: applicationTimelineEvent.id,
      eventType: applicationTimelineEvent.eventType,
      fromStage: applicationTimelineEvent.fromStage,
      toStage: applicationTimelineEvent.toStage,
      fromStatus: applicationTimelineEvent.fromStatus,
      toStatus: applicationTimelineEvent.toStatus,
      payload: applicationTimelineEvent.payload,
      createdAt: applicationTimelineEvent.createdAt,
    })
    .from(applicationTimelineEvent)
    .where(eq(applicationTimelineEvent.applicationId, applicationId))
    .orderBy(desc(applicationTimelineEvent.createdAt))

  return rows
}

export async function updateApplicationPipelineStage(input: {
  applicationId: string
  actorUserId: string
  companyId: string
  toStage: PipelineStage
  note?: string
}) {
  const normalizedNote = input.note?.trim() ? input.note : null

  const [row] = await db
    .select({
      id: application.id,
      pipelineStage: application.pipelineStage,
      status: application.status,
      studentUserId: application.studentUserId,
      offerCompanyId: internshipOffer.companyId,
    })
    .from(application)
    .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
    .where(eq(application.id, input.applicationId))
    .limit(1)

  if (!row) {
    throw new ApplicationServiceError(
      "APPLICATION_NOT_FOUND",
      "Application not found",
    )
  }

  if (row.offerCompanyId !== input.companyId) {
    throw new ApplicationServiceError(
      "APPLICATION_FORBIDDEN",
      "You do not have access to this application",
    )
  }

  if (input.toStage === "interview") {
    const [existingInterview] = await db
      .select({ id: interview.id })
      .from(interview)
      .where(eq(interview.applicationId, input.applicationId))
      .limit(1)

    if (!existingInterview) {
      throw new ApplicationServiceError(
        "APPLICATION_INVALID_STATE",
        "Schedule interview slots first before moving to interview stage",
      )
    }
  }

  if (row.status !== "applied") {
    throw new ApplicationServiceError(
      "APPLICATION_INVALID_STATE",
      "Pipeline stage can only be updated while the application is pending company review",
    )
  }

  if (
    input.toStage === "accepted" ||
    input.toStage === "validated" ||
    input.toStage === "rejected"
  ) {
    throw new ApplicationServiceError(
      "APPLICATION_INVALID_STATE",
      "Use explicit company/admin actions for terminal application decisions",
    )
  }

  const fromStage = row.pipelineStage
  if (!canTransitionStage(fromStage, input.toStage)) {
    throw new ApplicationServiceError(
      "APPLICATION_INVALID_STATE",
      `Invalid stage transition: ${fromStage} -> ${input.toStage}`,
    )
  }

  const [updatedApplication] = await db
    .update(application)
    .set({
      pipelineStage: input.toStage,
      pipelineStageUpdatedAt: new Date(),
    })
    .where(
      and(
        eq(application.id, input.applicationId),
        eq(application.status, row.status),
        eq(application.pipelineStage, fromStage),
      ),
    )
    .returning({ id: application.id })

  if (!updatedApplication) {
    throw new ApplicationServiceError(
      "APPLICATION_INVALID_STATE",
      "Application was changed by another action. Refresh and try again.",
    )
  }

  try {
    await appendTimelineEvent({
      applicationId: input.applicationId,
      actorUserId: input.actorUserId,
      eventType: "pipeline_stage_changed",
      fromStage,
      toStage: input.toStage,
      fromStatus: row.status,
      toStatus: row.status,
      payload: normalizedNote ? { note: normalizedNote } : {},
    })
  } catch (error) {
    log.error(
      { err: error, applicationId: input.applicationId },
      "Failed to append pipeline stage timeline event",
    )
  }

  if (row.studentUserId !== input.actorUserId) {
    try {
      await createNotification({
        userId: row.studentUserId,
        type: "application_stage_changed",
        payload: {
          applicationId: input.applicationId,
          stage: input.toStage,
          note: normalizedNote,
        },
      })
    } catch (error) {
      log.error(
        {
          err: error,
          applicationId: input.applicationId,
          userId: row.studentUserId,
        },
        "Failed to notify student about pipeline stage change",
      )
    }
  }

  return {
    applicationId: input.applicationId,
    studentUserId: row.studentUserId,
    fromStage,
    toStage: input.toStage,
  }
}
