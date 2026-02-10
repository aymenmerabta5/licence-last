import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { notification } from "@/server/db/schema/notifications"
import { internshipOffer } from "@/server/db/schema/internships"
import { company, companyMember } from "@/server/db/schema/companies"

export async function rejectPlacement(
  applicationId: string,
  adminUserId: string,
  reason?: string,
) {
  const [app] = await db
    .select({
      id: application.id,
      status: application.status,
      studentUserId: application.studentUserId,
      offerId: application.offerId,
      offerTitle: internshipOffer.title,
      companyId: internshipOffer.companyId,
      companyName: company.name,
    })
    .from(application)
    .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
    .innerJoin(company, eq(internshipOffer.companyId, company.id))
    .where(eq(application.id, applicationId))
    .limit(1)

  if (!app) {
    throw new Error("Application not found")
  }

  if (app.status !== "company_accepted") {
    throw new Error("Only company-accepted applications can be rejected by admin")
  }

  const now = new Date()

  await db
    .update(application)
    .set({
      status: "admin_rejected",
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

  return { success: true, applicationId }
}
