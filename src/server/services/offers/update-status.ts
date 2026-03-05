import "server-only"

import { and, eq, ne } from "drizzle-orm"
import { db } from "@/server/db"
import { internshipOffer } from "@/server/db/schema/internships"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"

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

    // Cancel pending interviews when offer closes
    const { interview } = await import("@/server/db/schema/interviews")
    await db
      .update(interview)
      .set({ status: "cancelled" })
      .where(
        and(
          eq(interview.offerId, offerId),
          ne(interview.status, "cancelled"),
        ),
      )

    log.info({ offerId, event: "offer_closed" }, "Offer closed")
    return { offerId, newStatus: "closed" as const }
  }

  throw new ServiceError("OFFER_INVALID_ACTION", `Invalid action: ${action}`)
}
