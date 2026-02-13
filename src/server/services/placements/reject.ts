import "server-only"

import { eq } from "drizzle-orm"

import { createModuleLogger } from "@/server/logging"
import { db } from "@/server/db"

const log = createModuleLogger("services/placements/reject")
import { application } from "@/server/db/schema/applications"
import { notification } from "@/server/db/schema/notifications"
import { internshipOffer } from "@/server/db/schema/internships"
import { company, companyMember } from "@/server/db/schema/companies"
import { user } from "@/server/db/schema/auth"
import { appendTimelineEvent } from "@/server/services/applications/pipeline"

export interface RejectPlacementInput {
  applicationId: string
  adminUserId: string
  adminRole: "admin" | "super_admin"
  adminUniversityId: string | null
  reason?: string
}

export async function rejectPlacement(
  input: RejectPlacementInput,
) {
  const { applicationId, adminUserId, adminRole, adminUniversityId, reason } = input

  const [app] = await db
    .select({
      id: application.id,
      status: application.status,
      pipelineStage: application.pipelineStage,
      studentUserId: application.studentUserId,
      offerId: application.offerId,
      offerTitle: internshipOffer.title,
      companyId: internshipOffer.companyId,
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
    throw new Error("Application not found")
  }

  if (app.status !== "company_accepted") {
    throw new Error("Only company-accepted applications can be rejected by admin")
  }

  // University admin scoping: admins can only reject placements for students
  // within their own university. Super admins can reject any.
  if (adminRole !== "super_admin") {
    if (!adminUniversityId) {
      throw new Error("Admin university not set")
    }
    if (!app.studentUniversityId || app.studentUniversityId !== adminUniversityId) {
      throw new Error("You do not have access to reject this application")
    }
  }

  log.info({ applicationId, adminUserId }, "Rejecting placement")

  const now = new Date()

  await db
    .update(application)
    .set({
      status: "admin_rejected",
      pipelineStage: "rejected",
      pipelineStageUpdatedAt: now,
      adminActionByUserId: adminUserId,
      adminActionAt: now,
      adminNote: reason ?? null,
    })
    .where(eq(application.id, applicationId))

  // Notify student
  await db.insert(notification).values({
    id: crypto.randomUUID(),
    userId: app.studentUserId,
    type: "placement_rejected",
    payload: {
      applicationId,
      offerId: app.offerId,
      offerTitle: app.offerTitle,
      companyName: app.companyName,
      reason: reason ?? null,
      stage: "rejected",
      status: "admin_rejected",
    },
  })

  await appendTimelineEvent({
    applicationId,
    actorUserId: adminUserId,
    eventType: "application_status_changed",
    fromStage: app.pipelineStage,
    toStage: "rejected",
    fromStatus: app.status,
    toStatus: "admin_rejected",
    payload: { reason: reason ?? null },
  })

  // Get company members to notify
  const companyMembers = await db
    .select({ userId: companyMember.userId })
    .from(companyMember)
    .where(eq(companyMember.companyId, app.companyId))

  // Notify company members
  if (companyMembers.length > 0) {
    await db.insert(notification).values(
      companyMembers.map((member) => ({
        id: crypto.randomUUID(),
        userId: member.userId,
        type: "placement_rejected",
        payload: {
          applicationId,
          offerId: app.offerId,
          offerTitle: app.offerTitle,
          studentUserId: app.studentUserId,
          reason: reason ?? null,
        },
      })),
    )
  }

  log.info({ applicationId, event: "placement_rejected" }, "Placement rejected")
  return { success: true, applicationId }
}
