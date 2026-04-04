import "server-only"

import { and, desc, eq, isNull } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { company } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"
import { offerMessageThread } from "@/server/db/schema/messages"

interface ListMessageStartersByStudentParams {
  limit?: number
}

export async function listMessageStartersByStudent(
  studentUserId: string,
  params: ListMessageStartersByStudentParams = {},
) {
  const limit = params.limit ?? 12

  const rows = await db
    .select({
      offerId: internshipOffer.id,
      offerTitle: internshipOffer.title,
      companyId: company.id,
      companyName: company.name,
      companyLogoUrl: company.logoUrl,
    })
    .from(application)
    .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
    .innerJoin(company, eq(internshipOffer.companyId, company.id))
    .leftJoin(
      offerMessageThread,
      and(
        eq(offerMessageThread.offerId, application.offerId),
        eq(offerMessageThread.studentUserId, application.studentUserId),
      ),
    )
    .where(
      and(
        eq(application.studentUserId, studentUserId),
        isNull(offerMessageThread.id),
      ),
    )
    .orderBy(desc(application.createdAt), desc(application.id))
    .limit(limit)

  return rows.map((row) => ({
    id: row.offerId,
    offerId: row.offerId,
    offerTitle: row.offerTitle,
    companyId: row.companyId,
    companyName: row.companyName,
    companyLogoUrl: row.companyLogoUrl,
  }))
}
