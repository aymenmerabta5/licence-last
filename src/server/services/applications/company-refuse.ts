import "server-only"

import { and, eq } from "drizzle-orm"
import { db } from "@/server/db"
import { createModuleLogger } from "@/server/logging"

const log = createModuleLogger("services/applications/company-refuse")

import { application } from "@/server/db/schema/applications"
import { company } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"
import { ApplicationServiceError } from "@/server/services/applications/errors"
import { appendTimelineEvent } from "@/server/services/applications/pipeline"
import { createNotification } from "@/server/services/notifications/create"

export async function companyRefuseApplication(
  applicationId: string,
  companyId: string,
  actionByUserId: string,
  note?: string,
) {
  const [app] = await db
    .select({
      id: application.id,
      status: application.status,
      pipelineStage: application.pipelineStage,
      offerId: application.offerId,
      studentUserId: application.studentUserId,
      offerTitle: internshipOffer.title,
      offerCompanyId: internshipOffer.companyId,
      companyName: company.name,
    })
    .from(application)
    .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
    .innerJoin(company, eq(internshipOffer.companyId, company.id))
    .where(eq(application.id, applicationId))
    .limit(1)

  if (!app) {
    throw new ApplicationServiceError(
      "APPLICATION_NOT_FOUND",
      "Application not found",
    )
  }

  if (app.offerCompanyId !== companyId) {
    throw new ApplicationServiceError(
      "APPLICATION_FORBIDDEN",
      "You do not have access to this application",
    )
  }

  if (app.status === "company_refused") {
    if (app.pipelineStage === "rejected") {
      log.info({ applicationId }, "Application already refused; returning idempotent success")
      return { success: true, applicationId }
    }

    log.warn(
      { applicationId, currentPipelineStage: app.pipelineStage },
      "Application status is company_refused but pipelineStage is not rejected; syncing",
    )

    await db
      .update(application)
      .set({
        pipelineStage: "rejected",
        pipelineStageUpdatedAt: new Date(),
      })
      .where(eq(application.id, applicationId))

    return { success: true, applicationId }
  }

  if (app.status !== "applied") {
    throw new ApplicationServiceError(
      "APPLICATION_INVALID_STATE",
      "Only pending applications can be refused",
    )
  }

  log.info({ applicationId, companyId, actionByUserId }, "Refusing application")

  const now = new Date()

  const [updatedApplication] = await db
    .update(application)
    .set({
      status: "company_refused",
      pipelineStage: "rejected",
      pipelineStageUpdatedAt: now,
      companyActionByUserId: actionByUserId,
      companyActionAt: now,
      companyNote: note ?? null,
    })
    .where(
      and(
        eq(application.id, applicationId),
        eq(application.status, app.status),
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
      applicationId,
      actorUserId: actionByUserId,
      eventType: "application_status_changed",
      fromStage: app.pipelineStage,
      toStage: "rejected",
      fromStatus: app.status,
      toStatus: "company_refused",
      payload: { companyNote: note ?? null },
    })
  } catch (error) {
    log.error(
      { err: error, applicationId },
      "Failed to append refusal timeline event",
    )
  }

  try {
    await createNotification({
      userId: app.studentUserId,
      type: "application_refused",
      payload: {
        applicationId,
        offerId: app.offerId,
        offerTitle: app.offerTitle,
        companyName: app.companyName,
        companyNote: note ?? null,
        stage: "rejected",
        status: "company_refused",
      },
    })
  } catch (error) {
    log.error(
      { err: error, applicationId },
      "Failed to notify student about refused application",
    )
  }

  log.info(
    { applicationId, event: "application_refused" },
    "Application refused by company",
  )
  return { success: true, applicationId }
}
