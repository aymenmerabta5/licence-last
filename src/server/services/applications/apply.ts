import "server-only"

import { eq, and, count } from "drizzle-orm"

import { db } from "@/server/db"
import { internshipOffer } from "@/server/db/schema/internships"
import { application } from "@/server/db/schema/applications"
import { companyMember } from "@/server/db/schema/companies"
import { notification } from "@/server/db/schema/notifications"

/**
 * Apply to an internship offer.
 * Validates the offer is published and open, the student hasn't already applied,
 * and positions aren't full. Notifies company members on success.
 */
export async function applyToOffer(
  offerId: string,
  studentUserId: string,
  coverLetter?: string,
) {
  // 1. Validate offer exists and is published
  const [offer] = await db
    .select()
    .from(internshipOffer)
    .where(eq(internshipOffer.id, offerId))
    .limit(1)

  if (!offer) {
    throw new Error("Offer not found")
  }

  if (offer.status !== "published") {
    throw new Error("Offer is not accepting applications")
  }

  if (offer.closesAt && offer.closesAt < new Date()) {
    throw new Error("Offer application deadline has passed")
  }

  // 2. Check positions not full (count admin_validated applications)
  const [validatedCount] = await db
    .select({ value: count() })
    .from(application)
    .where(
      and(
        eq(application.offerId, offerId),
        eq(application.status, "admin_validated"),
      ),
    )

  if ((validatedCount?.value ?? 0) >= offer.maxPositions) {
    throw new Error("All positions have been filled")
  }

  // 3. Check student hasn't already applied
  const [existing] = await db
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
    throw new Error("You have already applied to this offer")
  }

  // 4. Insert application
  const applicationId = crypto.randomUUID()
  await db.insert(application).values({
    id: applicationId,
    offerId,
    studentUserId,
    coverLetter: coverLetter ?? null,
    status: "applied",
  })

  // 5. Notify all company members
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

  return { applicationId }
}
