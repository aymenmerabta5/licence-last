import "server-only"

import { eq } from "drizzle-orm"
import { db } from "@/server/db"
import { createModuleLogger } from "@/server/logging"

const log = createModuleLogger("services/placements/reject")

import { application } from "@/server/db/schema/applications"
import { user } from "@/server/db/schema/auth"
import { company, companyMember } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"
import { studentProfile } from "@/server/db/schema/students"
import { appendTimelineEvent } from "@/server/services/applications/pipeline"
import { ServiceError } from "@/server/services/errors"
import { createNotification } from "@/server/services/notifications/create"

export interface RejectPlacementInput {
  applicationId: string
  adminUserId: string
  adminRole: "university_admin" | "department_head" | "super_admin"
  adminUniversityId: string | null
  /** Required when adminRole is "department_head" */
  adminDepartmentId?: string | null
  reason?: string
}

export async function rejectPlacement(input: RejectPlacementInput) {
  const {
    applicationId,
    adminUserId,
    adminRole,
    adminUniversityId,
    adminDepartmentId,
    reason,
  } = input

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
    throw new ServiceError("APPLICATION_NOT_FOUND", "Application not found")
  }

  if (app.status !== "company_accepted") {
    throw new ServiceError(
      "APPLICATION_NOT_COMPANY_ACCEPTED",
      "Only company-accepted applications can be rejected by admin",
    )
  }

  // Scoping: dept_head → department, admin → university, super_admin → any
  if (adminRole === "department_head") {
    if (!adminDepartmentId) {
      throw new ServiceError(
        "ADMIN_DEPARTMENT_NOT_SET",
        "Department head department not set",
      )
    }
    if (
      !app.studentDepartmentId ||
      app.studentDepartmentId !== adminDepartmentId
    ) {
      throw new ServiceError(
        "PLACEMENT_SCOPE_FORBIDDEN_DEPARTMENT",
        "You can only reject placements for students in your department",
      )
    }
  } else if (adminRole !== "super_admin") {
    if (!adminUniversityId) {
      throw new ServiceError(
        "ADMIN_UNIVERSITY_NOT_SET",
        "Admin university not set",
      )
    }
    if (
      !app.studentUniversityId ||
      app.studentUniversityId !== adminUniversityId
    ) {
      throw new ServiceError(
        "PLACEMENT_SCOPE_FORBIDDEN_UNIVERSITY",
        "You do not have access to reject this application",
      )
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
  await createNotification({
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
    await Promise.all(
      companyMembers.map((member) =>
        createNotification({
          userId: member.userId,
          type: "placement_rejected",
          payload: {
            applicationId,
            offerId: app.offerId,
            offerTitle: app.offerTitle,
            studentUserId: app.studentUserId,
            reason: reason ?? null,
          },
        }),
      ),
    )
  }

  log.info({ applicationId, event: "placement_rejected" }, "Placement rejected")
  return { success: true, applicationId }
}
