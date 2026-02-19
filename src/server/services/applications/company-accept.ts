import "server-only"

import { eq, and } from "drizzle-orm"

import { createModuleLogger } from "@/server/logging"
import { db } from "@/server/db"

const log = createModuleLogger("services/applications/company-accept")
import { application } from "@/server/db/schema/applications"
import { internshipOffer } from "@/server/db/schema/internships"
import { user } from "@/server/db/schema/auth"
import { studentProfile } from "@/server/db/schema/students"
import { company } from "@/server/db/schema/companies"
import { appendTimelineEvent } from "@/server/services/applications/pipeline"
import { ApplicationServiceError } from "@/server/services/applications/errors"
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
    throw new ApplicationServiceError("APPLICATION_NOT_FOUND", "Application not found")
  }

  if (app.offerCompanyId !== companyId) {
    throw new ApplicationServiceError("APPLICATION_FORBIDDEN", "You do not have access to this application")
  }

  if (app.status !== "applied") {
    throw new ApplicationServiceError("APPLICATION_INVALID_STATE", "Only pending applications can be accepted")
  }

  log.info({ applicationId, companyId, actionByUserId }, "Accepting application")

  const now = new Date()

  await db
    .update(application)
    .set({
      status: "company_accepted",
      pipelineStage: "offer",
      pipelineStageUpdatedAt: now,
      companyActionByUserId: actionByUserId,
      companyActionAt: now,
    })
    .where(eq(application.id, applicationId))

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

  // Notify the relevant validators: dept_head first, fallback to admin.
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

  // Try to find dept_head(s) for the student's department first
  let validators: { id: string }[] = []
  if (app.studentDepartmentId) {
    validators = await db
      .select({ id: user.id })
      .from(user)
      .where(
        and(
          eq(user.role, "dept_head"),
          eq(user.departmentId, app.studentDepartmentId),
        ),
      )
  }

  // Fallback: if no dept_head found, notify university admins
  if (validators.length === 0) {
    validators = await db
      .select({ id: user.id })
      .from(user)
      .where(
        and(
          eq(user.role, "university_admin"),
          eq(user.onboardingCompleted, true),
          eq(user.universityId, app.studentUniversityId),
        ),
      )
  }

  if (validators.length > 0) {
    await Promise.all(
      validators.map((validator) =>
        createNotification({
          userId: validator.id,
          type: "placement_pending_validation",
          payload: notificationPayload,
        }),
      ),
    )
  }

  log.info({ applicationId, event: "application_accepted" }, "Application accepted by company")
  return { success: true, applicationId }
}
