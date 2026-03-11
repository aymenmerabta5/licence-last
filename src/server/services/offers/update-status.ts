import "server-only"

import { and, eq, ne } from "drizzle-orm"
import { db } from "@/server/db"
import { internshipOffer } from "@/server/db/schema/internships"
import { interview } from "@/server/db/schema/interviews"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"
import { createNotification } from "@/server/services/notifications/create"

const log = createModuleLogger("services/offers/update-status")

function validatePublishTiming(existing: {
  applicationDeadlineAt: Date | null
  expectedStartDate: Date | null
  expectedEndDate: Date | null
}) {
  const { applicationDeadlineAt, expectedStartDate, expectedEndDate } = existing

  if (
    (expectedStartDate && !expectedEndDate) ||
    (!expectedStartDate && expectedEndDate)
  ) {
    throw new ServiceError(
      "OFFER_EXPECTED_PERIOD_INCOMPLETE",
      "Expected start and end dates must both be provided",
    )
  }

  if (
    expectedStartDate &&
    expectedEndDate &&
    expectedStartDate >= expectedEndDate
  ) {
    throw new ServiceError(
      "OFFER_EXPECTED_PERIOD_INVALID",
      "Expected start date must be before expected end date",
    )
  }

  if (
    applicationDeadlineAt &&
    expectedStartDate &&
    applicationDeadlineAt > expectedStartDate
  ) {
    throw new ServiceError(
      "OFFER_DEADLINE_AFTER_START",
      "Application deadline must be before expected start date",
    )
  }

  if (applicationDeadlineAt && applicationDeadlineAt < new Date()) {
    throw new ServiceError(
      "OFFER_DEADLINE_IN_PAST",
      "Application deadline cannot be in the past when publishing",
    )
  }
}

/**
 * Transition an offer's status.
 * Valid transitions: draft → published, published → closed.
 */
export async function updateOfferStatus(
  offerId: string,
  companyId: string,
  action: "publish" | "close",
) {
  const [existing] = await db
    .select({
      id: internshipOffer.id,
      companyId: internshipOffer.companyId,
      status: internshipOffer.status,
      applicationDeadlineAt: internshipOffer.applicationDeadlineAt,
      expectedStartDate: internshipOffer.expectedStartDate,
      expectedEndDate: internshipOffer.expectedEndDate,
    })
    .from(internshipOffer)
    .where(
      and(
        eq(internshipOffer.id, offerId),
        eq(internshipOffer.companyId, companyId),
      ),
    )
    .limit(1)

  if (!existing) {
    throw new ServiceError(
      "OFFER_NOT_FOUND",
      "Offer not found or access denied",
    )
  }

  log.info(
    { offerId, companyId, action, currentStatus: existing.status },
    "Updating offer status",
  )

  if (action === "publish") {
    if (existing.status !== "draft") {
      throw new ServiceError(
        "OFFER_INVALID_PUBLISH_STATUS",
        "Only draft offers can be published",
      )
    }

    validatePublishTiming(existing)

    await db
      .update(internshipOffer)
      .set({ status: "published", publishedAt: new Date() })
      .where(eq(internshipOffer.id, offerId))

    log.info({ offerId, event: "offer_published" }, "Offer published")
    return { offerId, newStatus: "published" as const }
  }

  if (action === "close") {
    if (existing.status !== "published") {
      throw new ServiceError(
        "OFFER_INVALID_CLOSE_STATUS",
        "Only published offers can be closed",
      )
    }
    await db
      .update(internshipOffer)
      .set({ status: "closed", closesAt: new Date() })
      .where(eq(internshipOffer.id, offerId))

    // Find students with active interviews before cancelling
    const affectedInterviews = await db
      .select({
        id: interview.id,
        studentUserId: interview.studentUserId,
      })
      .from(interview)
      .where(
        and(eq(interview.offerId, offerId), ne(interview.status, "cancelled")),
      )

    // Cancel pending interviews when offer closes
    if (affectedInterviews.length > 0) {
      await db
        .update(interview)
        .set({ status: "cancelled" })
        .where(
          and(
            eq(interview.offerId, offerId),
            ne(interview.status, "cancelled"),
          ),
        )

      // Notify affected students
      try {
        const notificationResults = await Promise.allSettled(
          affectedInterviews.map((row) =>
            createNotification({
              userId: row.studentUserId,
              type: "interview_cancelled",
              payload: {
                interviewId: row.id,
                offerId,
                reason: "offer_closed",
              },
            }),
          ),
        )

        const failedCount = notificationResults.filter(
          (item) => item.status === "rejected",
        ).length

        if (failedCount > 0) {
          log.warn(
            { offerId, failedCount, total: affectedInterviews.length },
            "Failed to notify some students about interview cancellation",
          )
        }
      } catch (error) {
        log.warn(
          { error, offerId },
          "Failed to dispatch interview cancellation notifications",
        )
      }
    }

    log.info({ offerId, event: "offer_closed" }, "Offer closed")
    return { offerId, newStatus: "closed" as const }
  }

  throw new ServiceError("OFFER_INVALID_ACTION", `Invalid action: ${action}`)
}
