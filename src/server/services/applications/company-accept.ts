import "server-only"

import { and, eq, isNull } from "drizzle-orm"
import { db } from "@/server/db"
import { createModuleLogger } from "@/server/logging"

const log = createModuleLogger("services/applications/company-accept")

import { application } from "@/server/db/schema/applications"
import { user } from "@/server/db/schema/auth"
import { company } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"
import { studentProfile } from "@/server/db/schema/students"
import { universityMember } from "@/server/db/schema/university-memberships"
import { ApplicationServiceError } from "@/server/services/applications/errors"
import { appendTimelineEvent } from "@/server/services/applications/pipeline"
import { createNotification } from "@/server/services/notifications/create"

export async function companyAcceptApplication(
  applicationId: string,
  companyId: string,
  actionByUserId: string,
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
      studentUniversityId: user.universityId,
      studentDepartmentId: studentProfile.departmentId,
    })
    .from(application)
    .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
    .innerJoin(company, eq(internshipOffer.companyId, company.id))
    .innerJoin(user, eq(application.studentUserId, user.id))
    .leftJoin(studentProfile, eq(user.id, studentProfile.userId))
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

  if (app.status !== "applied") {
    throw new ApplicationServiceError(
      "APPLICATION_INVALID_STATE",
      "Only pending applications can be accepted",
    )
  }

  log.info(
    { applicationId, companyId, actionByUserId },
    "Accepting application",
  )

  const now = new Date()

  const [updatedApplication] = await db
    .update(application)
    .set({
      status: "company_accepted",
      pipelineStage: "offer",
      pipelineStageUpdatedAt: now,
      companyActionByUserId: actionByUserId,
      companyActionAt: now,
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
      actorUserId: actionByUserId,
      eventType: "application_status_changed",
      fromStage: app.pipelineStage,
      toStage: "offer",
      fromStatus: app.status,
      toStatus: "company_accepted",
      payload: { reason: "company_accepted" },
    })
  } catch (error) {
    log.error(
      { err: error, applicationId },
      "Failed to append acceptance timeline event",
    )
  }

  try {
    await createNotification({
      userId: app.studentUserId,
      type: "application_stage_changed",
      payload: {
        applicationId,
        offerId: app.offerId,
        offerTitle: app.offerTitle,
        stage: "offer",
        status: "company_accepted",
      },
    })
  } catch (error) {
    log.error(
      { err: error, applicationId },
      "Failed to notify student about accepted application",
    )
  }

  if (!app.studentUniversityId) {
    return { success: true, applicationId }
  }

  const notificationPayload = {
    applicationId,
    offerId: app.offerId,
    offerTitle: app.offerTitle,
    studentUserId: app.studentUserId,
    companyId,
    companyName: app.companyName,
  }

  let validators: { id: string }[] = []
  if (app.studentDepartmentId) {
    validators = await db
      .select({ id: universityMember.userId })
      .from(universityMember)
      .where(
        and(
          eq(universityMember.role, "department_head"),
          eq(universityMember.departmentId, app.studentDepartmentId),
        ),
      )
  }

  if (validators.length === 0) {
    validators = await db
      .select({ id: user.id })
      .from(user)
      .leftJoin(universityMember, eq(universityMember.userId, user.id))
      .where(
        and(
          eq(user.role, "university_admin"),
          eq(user.onboardingCompleted, true),
          eq(user.universityId, app.studentUniversityId),
          isNull(universityMember.userId),
        ),
      )
  }

  if (validators.length > 0) {
    await Promise.all(
      validators.map(async (validator) => {
        try {
          await createNotification({
            userId: validator.id,
            type: "placement_pending_validation",
            payload: notificationPayload,
          })
        } catch (error) {
          log.error(
            { err: error, applicationId, validatorUserId: validator.id },
            "Failed to notify validator about pending placement",
          )
        }
      }),
    )
  }

  log.info(
    { applicationId, event: "application_accepted" },
    "Application accepted by company",
  )
  return { success: true, applicationId }
}
