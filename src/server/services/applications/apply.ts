import "server-only"

import { eq, and, count } from "drizzle-orm"

import { createModuleLogger } from "@/server/logging"
import { db } from "@/server/db"

const log = createModuleLogger("services/applications/apply")
import { internshipOffer } from "@/server/db/schema/internships"
import { application } from "@/server/db/schema/applications"
import { companyMember } from "@/server/db/schema/companies"
import { notification } from "@/server/db/schema/notifications"
import { appendTimelineEvent } from "@/server/services/applications/pipeline"
import { ApplicationServiceError } from "./errors"

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
      throw new ApplicationServiceError("OFFER_NOT_OPEN", "Offer is not accepting applications")
    }

    if (offer.closesAt && offer.closesAt < new Date()) {
      throw new ApplicationServiceError("OFFER_DEADLINE_PASSED", "Offer application deadline has passed")
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
      throw new ApplicationServiceError("OFFER_FULL", "All positions have been filled")
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
      throw new ApplicationServiceError("ALREADY_APPLIED", "You have already applied to this offer")
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
    .select({ companyId: internshipOffer.companyId, title: internshipOffer.title })
    .from(internshipOffer)
    .where(eq(internshipOffer.id, offerId))
    .limit(1)

  if (offer) {
    const members = await db
      .select({ userId: companyMember.userId })
      .from(companyMember)
      .where(eq(companyMember.companyId, offer.companyId))

    if (members.length > 0) {
      await db.insert(notification).values(
        members.map((m) => ({
          id: crypto.randomUUID(),
          userId: m.userId,
          type: "new_application",
          payload: {
            offerId,
            offerTitle: offer.title,
            studentUserId,
            applicationId,
          },
        })),
      )
    }
  }

  log.info({ applicationId, offerId, event: "application_created" }, "Application created successfully")
  return { applicationId }
}
