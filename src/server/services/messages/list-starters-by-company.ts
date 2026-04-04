import "server-only"

import { and, desc, eq, isNull } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { user } from "@/server/db/schema/auth"
import { internshipOffer } from "@/server/db/schema/internships"
import { offerMessageThread } from "@/server/db/schema/messages"

interface ListMessageStartersByCompanyParams {
  limit?: number
}

export async function listMessageStartersByCompany(
  companyId: string,
  params: ListMessageStartersByCompanyParams = {},
) {
  const limit = params.limit ?? 24

  const rows = await db
    .select({
      offerId: internshipOffer.id,
      offerTitle: internshipOffer.title,
      studentUserId: user.id,
      studentName: user.name,
      studentImage: user.image,
    })
    .from(application)
    .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
    .innerJoin(user, eq(application.studentUserId, user.id))
    .leftJoin(
      offerMessageThread,
      and(
        eq(offerMessageThread.offerId, application.offerId),
        eq(offerMessageThread.studentUserId, application.studentUserId),
      ),
    )
    .where(
      and(
        eq(internshipOffer.companyId, companyId),
        isNull(offerMessageThread.id),
      ),
    )
    .orderBy(desc(application.createdAt), desc(application.id))
    .limit(limit)

  return rows.map((row) => ({
    id: `${row.offerId}:${row.studentUserId}`,
    offerId: row.offerId,
    offerTitle: row.offerTitle,
    studentUserId: row.studentUserId,
    studentName: row.studentName,
    studentImage: row.studentImage,
  }))
}
