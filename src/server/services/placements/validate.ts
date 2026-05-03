import "server-only"

import { and, count, eq } from "drizzle-orm"
import { db } from "@/server/db"
import { createModuleLogger } from "@/server/logging"

const log = createModuleLogger("services/placements/validate")

import { application } from "@/server/db/schema/applications"
import { user } from "@/server/db/schema/auth"
import { company, companyMember } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"
import { placement, placementDocument } from "@/server/db/schema/placements"
import { studentProfile } from "@/server/db/schema/students"
import { appendTimelineEvent } from "@/server/services/applications/pipeline"
import { ServiceError } from "@/server/services/errors"
import { createNotification } from "@/server/services/notifications/create"

export interface ValidatePlacementInput {
  applicationId: string
  adminUserId: string
  adminRole: "university_admin" | "department_head" | "super_admin"
  adminUniversityId: string | null
  /** Required when adminRole is "department_head" — scopes validation to their department */
  adminDepartmentId?: string | null
  startDate?: Date
  endDate?: Date
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
      offerStatus: internshipOffer.status,
      expectedStartDate: internshipOffer.expectedStartDate,
      expectedEndDate: internshipOffer.expectedEndDate,
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
    throw new ServiceError("APPLICATION_NOT_FOUND", "Application not found")
  }

  if (app.offerStatus !== "published") {
    throw new ServiceError(
      "OFFER_NOT_PUBLISHED",
      "This offer is not published and cannot be validated",
    )
  }

  if (app.status !== "company_accepted") {
    throw new ServiceError(
      "APPLICATION_NOT_COMPANY_ACCEPTED",
      "Only company-accepted applications can be validated",
    )
  }

  // Scoping: dept_head can only validate students in their department,
  // admin can only validate students in their university,
  // super_admin can validate any.
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
        "You can only validate placements for students in your department",
      )
    }
  } else if (adminRole !== "super_admin") {
    if (!adminUniversityId) {
      throw new ServiceError(
        "ADMIN_UNIVERSITY_NOT_SET",
        "Admin university not set",
      )
    }
    if (!app.universityId || app.universityId !== adminUniversityId) {
      throw new ServiceError(
        "PLACEMENT_SCOPE_FORBIDDEN_UNIVERSITY",
        "You do not have access to validate this application",
      )
    }
  }

  let resolvedStartDate: Date
  let resolvedEndDate: Date
  if (startDate && endDate) {
    resolvedStartDate = startDate
    resolvedEndDate = endDate
  } else {
    if (!app.expectedStartDate || !app.expectedEndDate) {
      throw new ServiceError(
        "OFFER_EXPECTED_PERIOD_INCOMPLETE",
        "Offer expected start/end dates are required for validation",
      )
    }
    resolvedStartDate = app.expectedStartDate
    resolvedEndDate = app.expectedEndDate
  }

  const now = new Date()
  const placementId = crypto.randomUUID()
  log.info({ applicationId, adminUserId, placementId }, "Validating placement")

  // Create placement and update application in a transaction
  await db.transaction(async (tx) => {
    // Lock the application row to prevent concurrent validations
    await tx
      .select({ id: application.id })
      .from(application)
      .where(eq(application.id, applicationId))
      .for("update")
      .limit(1)

    // Lock the offer and verify it is still published
    const [lockedOffer] = await tx
      .select({
        id: internshipOffer.id,
        status: internshipOffer.status,
        maxPositions: internshipOffer.maxPositions,
      })
      .from(internshipOffer)
      .where(eq(internshipOffer.id, app.offerId))
      .for("update")
      .limit(1)

    if (!lockedOffer) {
      throw new ServiceError("OFFER_NOT_FOUND", "Offer not found")
    }

    if (lockedOffer.status !== "published") {
      throw new ServiceError(
        "OFFER_NOT_PUBLISHED",
        "This offer is not published and cannot be validated",
      )
    }

    // Explicit check for existing placement inside the transaction
    const [existingPlacement] = await tx
      .select({ id: placement.id })
      .from(placement)
      .where(eq(placement.applicationId, applicationId))
      .limit(1)

    if (existingPlacement) {
      throw new ServiceError(
        "PLACEMENT_ALREADY_EXISTS",
        "A placement already exists for this application",
      )
    }

    const [validatedPlacementsCount] = await tx
      .select({ value: count() })
      .from(placement)
      .innerJoin(application, eq(placement.applicationId, application.id))
      .where(eq(application.offerId, app.offerId))

    if ((validatedPlacementsCount?.value ?? 0) >= lockedOffer.maxPositions) {
      throw new ServiceError(
        "OFFER_FULL",
        "This offer has reached its maximum number of positions and cannot accept more placements",
      )
    }

    const [insertedPlacement] = await tx
      .insert(placement)
      .values({
        id: placementId,
        applicationId,
        validatedByUserId: adminUserId,
        validatedAt: now,
        startDate: resolvedStartDate,
        endDate: resolvedEndDate,
      })
      .onConflictDoNothing({
        target: [placement.applicationId],
      })
      .returning({ id: placement.id })

    if (!insertedPlacement) {
      throw new ServiceError(
        "PLACEMENT_ALREADY_EXISTS",
        "A placement already exists for this application",
      )
    }

    const [updatedApplication] = await tx
      .update(application)
      .set({
        status: "admin_validated",
        pipelineStage: "validated",
        pipelineStageUpdatedAt: now,
        adminActionByUserId: adminUserId,
        adminActionAt: now,
      })
      .where(
        and(
          eq(application.id, applicationId),
          eq(application.status, app.status),
        ),
      )
      .returning({ id: application.id })

    if (!updatedApplication) {
      throw new ServiceError(
        "APPLICATION_NOT_COMPANY_ACCEPTED",
        "Only company-accepted applications can be validated",
      )
    }

    // Create pending document record
    await tx.insert(placementDocument).values({
      id: crypto.randomUUID(),
      placementId,
      type: "agreement",
      status: "pending",
    })
  })

  try {
    await createNotification({
      userId: app.studentUserId,
      type: "placement_validated",
      payload: {
        placementId,
        applicationId,
        offerId: app.offerId,
        offerTitle: app.offerTitle,
        companyName: app.companyName,
        startDate: resolvedStartDate.toISOString(),
        endDate: resolvedEndDate.toISOString(),
        stage: "validated",
        status: "admin_validated",
      },
    })
  } catch (error) {
    log.error(
      { err: error, applicationId, placementId },
      "Failed to notify student about validated placement",
    )
  }

  try {
    await appendTimelineEvent({
      applicationId,
      actorUserId: adminUserId,
      eventType: "application_status_changed",
        fromStage: app.pipelineStage,
        toStage: "validated",
        fromStatus: app.status,
        toStatus: "admin_validated",
      payload: {
        startDate: resolvedStartDate.toISOString(),
        endDate: resolvedEndDate.toISOString(),
      },
    })
  } catch (error) {
    log.error(
      { err: error, applicationId, placementId },
      "Failed to append placement validation timeline event",
    )
  }

  // Get company members to notify
  const companyMembers = await db
    .select({ userId: companyMember.userId })
    .from(companyMember)
    .where(eq(companyMember.companyId, app.companyId))

  // Notify company members
  if (companyMembers.length > 0) {
    await Promise.all(
      companyMembers.map(async (member) => {
        try {
          await createNotification({
            userId: member.userId,
            type: "placement_validated",
            payload: {
              placementId,
              applicationId,
              offerId: app.offerId,
              offerTitle: app.offerTitle,
              studentUserId: app.studentUserId,
              studentName: app.studentName,
              startDate: resolvedStartDate.toISOString(),
              endDate: resolvedEndDate.toISOString(),
            },
          })
        } catch (error) {
          log.error(
            { err: error, applicationId, placementId, userId: member.userId },
            "Failed to notify company member about validated placement",
          )
        }
      }),
    )
  }

  log.info(
    { placementId, applicationId, event: "placement_validated" },
    "Placement validated successfully",
  )
  return {
    success: true,
    placementId,
    applicationId,
  }
}
