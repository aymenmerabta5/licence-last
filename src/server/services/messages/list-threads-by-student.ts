import "server-only"

import { desc, eq } from "drizzle-orm"

import { db } from "@/server/db"
import { company } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"
import { offerMessageThread } from "@/server/db/schema/messages"

interface ListStudentMessageThreadsParams {
  limit?: number
}

export async function listMessageThreadsByStudent(
  studentUserId: string,
  params: ListStudentMessageThreadsParams = {},
) {
  const { limit = 30 } = params

  return db
    .select({
      id: offerMessageThread.id,
      offerId: offerMessageThread.offerId,
      offerTitle: internshipOffer.title,
      companyId: offerMessageThread.companyId,
      companyName: company.name,
      companyLogoUrl: company.logoUrl,
      lastMessageAt: offerMessageThread.lastMessageAt,
      createdAt: offerMessageThread.createdAt,
    })
    .from(offerMessageThread)
    .innerJoin(internshipOffer, eq(offerMessageThread.offerId, internshipOffer.id))
    .innerJoin(company, eq(offerMessageThread.companyId, company.id))
    .where(eq(offerMessageThread.studentUserId, studentUserId))
    .orderBy(desc(offerMessageThread.lastMessageAt), desc(offerMessageThread.id))
    .limit(limit)
}
