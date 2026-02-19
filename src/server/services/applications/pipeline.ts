import "server-only"

import { desc, eq } from "drizzle-orm"

import { db } from "@/server/db"
import {
  application,
  applicationTimelineEvent,
} from "@/server/db/schema/applications"
import { internshipOffer } from "@/server/db/schema/internships"
import { ApplicationServiceError } from "@/server/services/applications/errors"
import { createNotification } from "@/server/services/notifications/create"

export type PipelineStage =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "accepted"
  | "rejected"

const STAGE_TRANSITIONS: Record<PipelineStage, PipelineStage[]> = {
  applied: ["screening", "interview", "offer", "rejected"],
  screening: ["applied", "interview", "offer", "rejected"],
  interview: ["screening", "offer", "rejected"],
  offer: ["rejected", "interview"],
  accepted: [],
  rejected: [],
}

export function canTransitionStage(from: PipelineStage, to: PipelineStage) {
  return STAGE_TRANSITIONS[from].includes(to)
}

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

  const fromStage = row.pipelineStage
  if (!canTransitionStage(fromStage, input.toStage)) {
    throw new ApplicationServiceError(
      "APPLICATION_INVALID_STATE",
      `Invalid stage transition: ${fromStage} -> ${input.toStage}`,
    )
  }

  await db
    .update(application)
    .set({
      pipelineStage: input.toStage,
      pipelineStageUpdatedAt: new Date(),
    })
    .where(eq(application.id, input.applicationId))

  await appendTimelineEvent({
    applicationId: input.applicationId,
    actorUserId: input.actorUserId,
    eventType: "pipeline_stage_changed",
    fromStage,
    toStage: input.toStage,
    fromStatus: row.status,
    toStatus: row.status,
    payload: input.note ? { note: input.note } : {},
  })

  if (row.studentUserId !== input.actorUserId) {
    await createNotification({
      userId: row.studentUserId,
      type: "application_stage_changed",
      payload: {
        applicationId: input.applicationId,
        stage: input.toStage,
        note: input.note ?? null,
      },
    })
  }

  return {
    applicationId: input.applicationId,
    studentUserId: row.studentUserId,
    fromStage,
    toStage: input.toStage,
  }
}
