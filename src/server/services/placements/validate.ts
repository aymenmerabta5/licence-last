import "server-only"

import { eq } from "drizzle-orm"

import { createModuleLogger } from "@/server/logging"
import { db } from "@/server/db"

const log = createModuleLogger("services/placements/validate")
import { application } from "@/server/db/schema/applications"
import { placement, placementDocument } from "@/server/db/schema/placements"
import { notification } from "@/server/db/schema/notifications"
import { internshipOffer } from "@/server/db/schema/internships"
import { company, companyMember } from "@/server/db/schema/companies"
import { user } from "@/server/db/schema/auth"
import { studentProfile } from "@/server/db/schema/students"
import { appendTimelineEvent } from "@/server/services/applications/pipeline"

export interface ValidatePlacementInput {
  applicationId: string
  adminUserId: string
  adminRole: "university_admin" | "dept_head" | "super_admin"
  adminUniversityId: string | null
  /** Required when adminRole is "dept_head" — scopes validation to their department */
  adminDepartmentId?: string | null
  startDate: Date
  endDate: Date
}

export interface ValidatePlacementResult {
  success: boolean
  placementId: string
  applicationId: string
}

export async function validatePlacement(
  input: ValidatePlacementInput,
): Promise<ValidatePlacementResult> {
  const {
    applicationId,
    adminUserId,
    adminRole,
    adminUniversityId,
    adminDepartmentId,
    startDate,
    endDate,
  } = input

  const [app] = await db
    .select({
      id: application.id,
      status: application.status,
      pipelineStage: application.pipelineStage,
      studentUserId: application.studentUserId,
      offerId: application.offerId,
      offerTitle: internshipOffer.title,
      offerInternshipType: internshipOffer.internshipType,
      companyId: internshipOffer.companyId,
      companyName: company.name,
      companyAddress: company.address,
      companyPhone: company.phone,
      companyRepresentativeName: company.representativeName,
      studentName: user.name,
      studentEmail: user.email,
      universityId: user.universityId,
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
    throw new Error("Application not found")
  }

  if (app.status !== "company_accepted") {
    throw new Error("Only company-accepted applications can be validated")
  }

  // Scoping: dept_head can only validate students in their department,
  // admin can only validate students in their university,
  // super_admin can validate any.
  if (adminRole === "dept_head") {
    if (!adminDepartmentId) {
      throw new Error("Department head department not set")
    }
    if (!app.studentDepartmentId || app.studentDepartmentId !== adminDepartmentId) {
      throw new Error("You can only validate placements for students in your department")
    }
  } else if (adminRole !== "super_admin") {
    if (!adminUniversityId) {
      throw new Error("Admin university not set")
    }
    if (!app.universityId || app.universityId !== adminUniversityId) {
      throw new Error("You do not have access to validate this application")
    }
  }

  // Check if placement already exists
  const [existingPlacement] = await db
    .select({ id: placement.id })
    .from(placement)
    .where(eq(placement.applicationId, applicationId))
    .limit(1)

  if (existingPlacement) {
    throw new Error("Placement already exists for this application")
  }

  const now = new Date()
  const placementId = crypto.randomUUID()
  log.info({ applicationId, adminUserId, placementId }, "Validating placement")

  // Create placement and update application in a transaction
  await db.transaction(async (tx) => {
    // Create placement
    await tx.insert(placement).values({
      id: placementId,
      applicationId,
      validatedByUserId: adminUserId,
      validatedAt: now,
      startDate,
      endDate,
    })

    // Update application status
    await tx
      .update(application)
      .set({
        status: "admin_validated",
        pipelineStage: "accepted",
        pipelineStageUpdatedAt: now,
        adminActionByUserId: adminUserId,
        adminActionAt: now,
      })
      .where(eq(application.id, applicationId))

    // Create pending document record
    await tx.insert(placementDocument).values({
      id: crypto.randomUUID(),
      placementId,
      type: "agreement",
      status: "pending",
    })
  })

  // Notify student
  await db.insert(notification).values({
    id: crypto.randomUUID(),
    userId: app.studentUserId,
    type: "placement_validated",
    payload: {
      placementId,
      applicationId,
      offerId: app.offerId,
      offerTitle: app.offerTitle,
      companyName: app.companyName,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      stage: "accepted",
      status: "admin_validated",
    },
  })

  await appendTimelineEvent({
    applicationId,
    actorUserId: adminUserId,
    eventType: "application_status_changed",
    fromStage: app.pipelineStage,
    toStage: "accepted",
    fromStatus: app.status,
    toStatus: "admin_validated",
    payload: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
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
        type: "placement_validated",
        payload: {
          placementId,
          applicationId,
          offerId: app.offerId,
          offerTitle: app.offerTitle,
          studentUserId: app.studentUserId,
          studentName: app.studentName,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      })),
    )
  }

  log.info({ placementId, applicationId, event: "placement_validated" }, "Placement validated successfully")
  return {
    success: true,
    placementId,
    applicationId,
  }
}
