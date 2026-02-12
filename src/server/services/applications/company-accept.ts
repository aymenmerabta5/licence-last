import "server-only"

import { eq, and } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { internshipOffer } from "@/server/db/schema/internships"
import { notification } from "@/server/db/schema/notifications"
import { user } from "@/server/db/schema/auth"
import { company } from "@/server/db/schema/companies"
import { appendTimelineEvent } from "@/server/services/applications/pipeline"
import { ApplicationServiceError } from "./errors"

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
    })
    .from(application)
    .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
    .innerJoin(company, eq(internshipOffer.companyId, company.id))
    .innerJoin(user, eq(application.studentUserId, user.id))
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

  await db.insert(notification).values({
    id: crypto.randomUUID(),
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

  // Notify the relevant university admins only.
  if (!app.studentUniversityId) {
    return { success: true, applicationId }
  }

  const admins = await db
    .select({ id: user.id })
    .from(user)
    .where(
      and(
        eq(user.role, "admin"),
        eq(user.onboardingCompleted, true),
        eq(user.universityId, app.studentUniversityId),
      ),
    )

  if (admins.length > 0) {
    await db.insert(notification).values(
      admins.map((admin) => ({
        id: crypto.randomUUID(),
        userId: admin.id,
        type: "placement_pending_validation",
        payload: {
          applicationId,
          offerId: app.offerId,
          offerTitle: app.offerTitle,
          studentUserId: app.studentUserId,
          companyId,
          companyName: app.companyName,
        },
      })),
    )
  }

  return { success: true, applicationId }
}
