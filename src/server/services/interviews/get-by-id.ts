import "server-only"

import { eq, asc } from "drizzle-orm"

import { db } from "@/server/db"
import { company } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"
import { interview, interviewSlot } from "@/server/db/schema/interviews"
import { interviewStatusEnum } from "@/server/db/schema/enums"
import { InterviewServiceError } from "@/server/services/interviews/errors"

type InterviewStatus = (typeof interviewStatusEnum.enumValues)[number]

export interface InterviewDetailView {
  id: string
  applicationId: string
  offerId: string
  offerTitle: string
  companyId: string
  companyName: string
  companyLogoUrl: string | null
  status: InterviewStatus
  confirmedSlotId: string | null
  confirmedAt: Date | null
  note: string | null
  createdAt: Date
  updatedAt: Date
  slots: Array<{
    id: string
    interviewId: string
    startsAt: Date
    endsAt: Date
    location: string | null
    meetingUrl: string | null
  }>
}

export async function getInterviewById(
  interviewId: string,
  studentUserId: string,
): Promise<InterviewDetailView> {
  const [interviewRow] = await db
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
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
      studentUserId: interview.studentUserId,
    })
    .from(interview)
    .innerJoin(internshipOffer, eq(interview.offerId, internshipOffer.id))
    .innerJoin(company, eq(interview.companyId, company.id))
    .where(eq(interview.id, interviewId))
    .limit(1)

  if (!interviewRow) {
    throw new InterviewServiceError("INTERVIEW_NOT_FOUND", "Interview not found")
  }

  if (interviewRow.studentUserId !== studentUserId) {
    throw new InterviewServiceError(
      "INTERVIEW_FORBIDDEN",
      "You do not have access to this interview",
    )
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
    .where(eq(interviewSlot.interviewId, interviewId))
    .orderBy(asc(interviewSlot.startsAt))

  const { studentUserId: _, ...rest } = interviewRow

  return {
    ...rest,
    slots,
  }
}
