import "server-only"

import { and, asc, desc, eq, inArray } from "drizzle-orm"

import { db } from "@/server/db"
import { company } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"
import { interview, interviewSlot } from "@/server/db/schema/interviews"

interface ListStudentInterviewsParams {
  status?:
    | "pending_confirmation"
    | "confirmed"
    | "cancelled"
    | "completed"
    | "reschedule_requested"
  limit?: number
}

export async function listInterviewsForStudent(
  studentUserId: string,
  params: ListStudentInterviewsParams = {},
) {
  const { status, limit = 30 } = params

  const conditions = [eq(interview.studentUserId, studentUserId)]

  if (status) {
    conditions.push(eq(interview.status, status))
  }

  const interviews = await db
    .select({
      id: interview.id,
      applicationId: interview.applicationId,
      offerId: interview.offerId,
      offerTitle: internshipOffer.title,
      companyId: interview.companyId,
      companyName: company.name,
      companyLogoUrl: company.logoUrl,
      status: interview.status,
      confirmedSlotId: interview.confirmedSlotId,
      confirmedAt: interview.confirmedAt,
      note: interview.note,
      rescheduleNote: interview.rescheduleNote,
      rescheduleRequestedAt: interview.rescheduleRequestedAt,
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
    })
    .from(interview)
    .innerJoin(internshipOffer, eq(interview.offerId, internshipOffer.id))
    .innerJoin(company, eq(interview.companyId, company.id))
    .where(and(...conditions))
    .orderBy(desc(interview.createdAt))
    .limit(limit)

  if (interviews.length === 0) {
    return []
  }

  const slots = await db
    .select({
      id: interviewSlot.id,
      interviewId: interviewSlot.interviewId,
      startsAt: interviewSlot.startsAt,
      endsAt: interviewSlot.endsAt,
      location: interviewSlot.location,
      meetingUrl: interviewSlot.meetingUrl,
    })
    .from(interviewSlot)
    .where(
      inArray(
        interviewSlot.interviewId,
        interviews.map((row) => row.id),
      ),
    )
    .orderBy(asc(interviewSlot.startsAt))

  const slotsByInterview = new Map<string, typeof slots>()
  for (const slot of slots) {
    const existing = slotsByInterview.get(slot.interviewId) ?? []
    existing.push(slot)
    slotsByInterview.set(slot.interviewId, existing)
  }

  return interviews.map((row) => ({
    ...row,
    slots: slotsByInterview.get(row.id) ?? [],
  }))
}
