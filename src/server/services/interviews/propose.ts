import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { internshipOffer } from "@/server/db/schema/internships"
import { interview, interviewSlot } from "@/server/db/schema/interviews"
import { InterviewServiceError } from "@/server/services/interviews/errors"

interface ProposedInterviewSlotInput {
  startsAt: Date
  endsAt: Date
  location?: string | null
  meetingUrl?: string | null
}

interface ProposeInterviewInput {
  applicationId: string
  note?: string
  slots: ProposedInterviewSlotInput[]
}

export async function proposeInterviewSlots(
  input: ProposeInterviewInput,
  companyId: string,
  actorUserId: string,
) {
  if (input.slots.length === 0) {
    throw new InterviewServiceError(
      "INTERVIEW_SLOT_INVALID",
      "At least one slot must be proposed",
    )
  }

  for (const slot of input.slots) {
    if (slot.startsAt >= slot.endsAt) {
      throw new InterviewServiceError(
        "INTERVIEW_SLOT_INVALID",
        "Each slot start time must be before end time",
      )
    }
  }

  const interviewId = crypto.randomUUID()

  const result = await db.transaction(async (tx) => {
    const [applicationRow] = await tx
      .select({
        id: application.id,
        status: application.status,
        offerId: application.offerId,
        studentUserId: application.studentUserId,
        companyId: internshipOffer.companyId,
      })
      .from(application)
      .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
      .where(eq(application.id, input.applicationId))
      .for("update")
      .limit(1)

    if (!applicationRow) {
      throw new InterviewServiceError(
        "APPLICATION_NOT_FOUND",
        "Application not found",
      )
    }

    if (applicationRow.companyId !== companyId) {
      throw new InterviewServiceError(
        "APPLICATION_FORBIDDEN",
        "You do not have access to this application",
      )
    }

    if (
      applicationRow.status === "withdrawn" ||
      applicationRow.status === "company_refused" ||
      applicationRow.status === "admin_rejected"
    ) {
      throw new InterviewServiceError(
        "INTERVIEW_INVALID_APPLICATION_STATE",
        "Interview cannot be proposed for this application status",
      )
    }

    const [existingInterview] = await tx
      .select({
        id: interview.id,
      })
      .from(interview)
      .where(eq(interview.applicationId, input.applicationId))
      .limit(1)

    if (existingInterview) {
      throw new InterviewServiceError(
        "INTERVIEW_ALREADY_EXISTS",
        "Interview already exists for this application",
      )
    }

    await tx.insert(interview).values({
      id: interviewId,
      applicationId: input.applicationId,
      offerId: applicationRow.offerId,
      companyId,
      studentUserId: applicationRow.studentUserId,
      proposedByUserId: actorUserId,
      status: "pending_confirmation",
      note: input.note?.trim() ? input.note.trim() : null,
    })

    await tx.insert(interviewSlot).values(
      input.slots.map((slot) => ({
        id: crypto.randomUUID(),
        interviewId,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
        location: slot.location?.trim() ? slot.location.trim() : null,
        meetingUrl: slot.meetingUrl?.trim() ? slot.meetingUrl.trim() : null,
      })),
    )

    return {
      interviewId,
      studentUserId: applicationRow.studentUserId,
    }
  })

  return result
}
