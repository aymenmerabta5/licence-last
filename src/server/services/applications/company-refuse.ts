import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { internshipOffer } from "@/server/db/schema/internships"
import { notification } from "@/server/db/schema/notifications"
import { company } from "@/server/db/schema/companies"

export async function companyRefuseApplication(
  applicationId: string,
  companyId: string,
  actionByUserId: string,
  note?: string,
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
    throw new Error("Only pending applications can be refused")
  }

  const now = new Date()

  await db
    .update(application)
    .set({
      status: "company_refused",
      companyActionByUserId: actionByUserId,
      companyActionAt: now,
      companyNote: note ?? null,
    })
    .where(eq(application.id, applicationId))

  await db.insert(notification).values({
    id: crypto.randomUUID(),
    userId: app.studentUserId,
    type: "application_refused",
    payload: {
      applicationId,
      offerId: app.offerId,
      offerTitle: app.offerTitle,
      companyName: app.companyName,
      companyNote: note ?? null,
    },
  })

  return { success: true, applicationId }
}
