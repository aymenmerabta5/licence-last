import "server-only"

import { eq, and } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { internshipOffer } from "@/server/db/schema/internships"
import { notification } from "@/server/db/schema/notifications"
import { user } from "@/server/db/schema/auth"
import { company } from "@/server/db/schema/companies"

export async function companyAcceptApplication(
  applicationId: string,
  companyId: string,
  actionByUserId: string,
) {
  const [app] = await db
    .select({
      id: application.id,
      status: application.status,
      offerId: application.offerId,
      studentUserId: application.studentUserId,
      offerTitle: internshipOffer.title,
      offerCompanyId: internshipOffer.companyId,
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

  if (app.offerCompanyId !== companyId) {
    throw new Error("You do not have access to this application")
  }

  if (app.status !== "applied") {
    throw new Error("Only pending applications can be accepted")
  }

  const now = new Date()

  await db
    .update(application)
    .set({
      status: "company_accepted",
      companyActionByUserId: actionByUserId,
      companyActionAt: now,
    })
    .where(eq(application.id, applicationId))

  const admins = await db
    .select({ id: user.id })
    .from(user)
    .where(
      and(
        eq(user.role, "admin"),
        eq(user.onboardingCompleted, true),
      ),
    )

  if (admins.length > 0) {
    await db.insert(notification).values(
      admins.map((admin) => ({
        id: crypto.randomUUID(),
        userId: admin.id,
        type: "placement_pending_validation",
        payload: {
          applicationId,
          offerId: app.offerId,
          offerTitle: app.offerTitle,
          studentUserId: app.studentUserId,
          companyId,
          companyName: app.companyName,
        },
      })),
    )
  }

  return { success: true, applicationId }
}
