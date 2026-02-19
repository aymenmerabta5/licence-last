import "server-only"

import { and, count, eq } from "drizzle-orm"
import { db } from "@/server/db"
import { createModuleLogger } from "@/server/logging"

const log = createModuleLogger("services/applications/apply")

import { application } from "@/server/db/schema/applications"
import { company, companyMember } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"
import { ApplicationServiceError } from "@/server/services/applications/errors"
import { appendTimelineEvent } from "@/server/services/applications/pipeline"
import { createNotification } from "@/server/services/notifications/create"

/**
 * Apply to an internship offer.
 * Validates the offer is published and open, the student hasn't already applied,
 * and positions aren't full. Notifies company members on success.
 *
 * Uses a transaction with row-level locking to prevent race conditions
 * (duplicate applications, exceeding maxPositions).
 */
export async function applyToOffer(
  offerId: string,
  studentUserId: string,
  coverLetter?: string,
) {
  const applicationId = crypto.randomUUID()
  log.info({ offerId, studentUserId, applicationId }, "Applying to offer")

  // Wrap all validation + insert in a transaction to prevent TOCTOU races
  await db.transaction(async (tx) => {
    // 1. Lock the offer row and validate it exists and is published
    const [offer] = await tx
      .select()
      .from(internshipOffer)
      .where(eq(internshipOffer.id, offerId))
      .for("update")
      .limit(1)

    if (!offer) {
      throw new ApplicationServiceError("OFFER_NOT_FOUND", "Offer not found")
    }

    if (offer.status !== "published") {
      throw new ApplicationServiceError(
        "OFFER_NOT_OPEN",
        "Offer is not accepting applications",
      )
    }

    if (
      offer.applicationDeadlineAt &&
      offer.applicationDeadlineAt < new Date()
    ) {
      throw new ApplicationServiceError(
        "OFFER_DEADLINE_PASSED",
        "Offer application deadline has passed",
      )
    }

    const [offerCompany] = await tx
      .select({ status: company.status })
      .from(company)
      .where(eq(company.id, offer.companyId))
      .limit(1)

    if (!offerCompany || offerCompany.status !== "approved") {
      throw new ApplicationServiceError(
        "OFFER_NOT_OPEN",
        "Offer is not accepting applications",
      )
    }

    // 2. Check positions not full (count admin_validated applications)
    const [validatedCount] = await tx
      .select({ value: count() })
      .from(application)
      .where(
        and(
          eq(application.offerId, offerId),
          eq(application.status, "admin_validated"),
        ),
      )

    if ((validatedCount?.value ?? 0) >= offer.maxPositions) {
      throw new ApplicationServiceError(
        "OFFER_FULL",
        "All positions have been filled",
      )
    }

    // 3. Check student hasn't already applied
    const [existing] = await tx
      .select({ id: application.id })
      .from(application)
      .where(
        and(
          eq(application.offerId, offerId),
          eq(application.studentUserId, studentUserId),
        ),
      )
      .limit(1)

    if (existing) {
      throw new ApplicationServiceError(
        "ALREADY_APPLIED",
        "You have already applied to this offer",
      )
    }

    // 4. Insert application (inside transaction)
    await tx.insert(application).values({
      id: applicationId,
      offerId,
      studentUserId,
      coverLetter: coverLetter ?? null,
      status: "applied",
      pipelineStage: "applied",
      pipelineStageUpdatedAt: new Date(),
    })
  })

  // 5. Post-transaction: timeline event + notifications (non-critical, outside tx)
  await appendTimelineEvent({
    applicationId,
    actorUserId: studentUserId,
    eventType: "application_created",
    toStage: "applied",
    toStatus: "applied",
    payload: { offerId },
  })

  // Fetch offer for notification context
  const [offer] = await db
    .select({
      companyId: internshipOffer.companyId,
      title: internshipOffer.title,
    })
    .from(internshipOffer)
    .where(eq(internshipOffer.id, offerId))
    .limit(1)

  if (offer) {
    const members = await db
      .select({ userId: companyMember.userId })
      .from(companyMember)
      .where(eq(companyMember.companyId, offer.companyId))

    if (members.length > 0) {
      await Promise.all(
        members.map((member) =>
          createNotification({
            userId: member.userId,
            type: "new_application",
            payload: {
              offerId,
              offerTitle: offer.title,
              studentUserId,
              applicationId,
            },
          }),
        ),
      )
    }
  }

  log.info(
    { applicationId, offerId, event: "application_created" },
    "Application created successfully",
  )
  return { applicationId }
}
