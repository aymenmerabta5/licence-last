import "server-only"

import { desc, eq, inArray } from "drizzle-orm"
import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { user } from "@/server/db/schema/auth"
import { company } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"
import { interview, interviewSlot } from "@/server/db/schema/interviews"
import { placement, placementDocument } from "@/server/db/schema/placements"

export interface ApplicationJourney {
  id: string
  status: string
  pipelineStage: string
  createdAt: Date
  offerId: string
  offerTitle: string
  offerInternshipType: string
  offerWorkMode: string | null
  offerWilayaCode: number | null
  companyName: string
  companySlug: string
  companyLogoUrl: string | null
  interviews: Array<{
    id: string
    status: string
    note: string | null
    confirmedSlotId: string | null
    slots: Array<{
      id: string
      startsAt: Date
      endsAt: Date
      location: string | null
      meetingUrl: string | null
    }>
  }>
  placement: {
    placementId: string
    startDate: Date
    endDate: Date
    validatedAt: Date
    validatedByName: string | null
    documents: Array<{
      id: string
      type: "agreement" | "certificate"
      status: string
      verificationCode: string | null
      locale: string
      borderStyle: string
    }>
  } | null
}

export async function listStudentApplicationJourneys(
  studentUserId: string,
): Promise<ApplicationJourney[]> {
  const applications = await db
    .select({
      id: application.id,
      status: application.status,
      pipelineStage: application.pipelineStage,
      createdAt: application.createdAt,
      offerId: internshipOffer.id,
      offerTitle: internshipOffer.title,
      offerInternshipType: internshipOffer.internshipType,
      offerWorkMode: internshipOffer.workMode,
      offerWilayaCode: internshipOffer.wilayaCode,
      companyName: company.name,
      companySlug: company.slug,
      companyLogoUrl: company.logoUrl,
    })
    .from(application)
    .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
    .innerJoin(company, eq(internshipOffer.companyId, company.id))
    .where(eq(application.studentUserId, studentUserId))
    .orderBy(desc(application.createdAt))

  if (applications.length === 0) {
    return []
  }

  const applicationIds = applications.map((a) => a.id)

  const interviews =
    applicationIds.length > 0
      ? await db
          .select({
            id: interview.id,
            applicationId: interview.applicationId,
            status: interview.status,
            note: interview.note,
            confirmedSlotId: interview.confirmedSlotId,
          })
          .from(interview)
          .where(inArray(interview.applicationId, applicationIds))
      : []

  const interviewIds = interviews.map((i) => i.id)

  const slots =
    interviewIds.length > 0
      ? await db
          .select({
            id: interviewSlot.id,
            interviewId: interviewSlot.interviewId,
            startsAt: interviewSlot.startsAt,
            endsAt: interviewSlot.endsAt,
            location: interviewSlot.location,
            meetingUrl: interviewSlot.meetingUrl,
          })
          .from(interviewSlot)
          .where(inArray(interviewSlot.interviewId, interviewIds))
      : []

  const placements =
    applicationIds.length > 0
      ? await db
          .select({
            id: placement.id,
            applicationId: placement.applicationId,
            validatedByUserId: placement.validatedByUserId,
            validatedAt: placement.validatedAt,
            startDate: placement.startDate,
            endDate: placement.endDate,
          })
          .from(placement)
          .where(inArray(placement.applicationId, applicationIds))
      : []

  const placementIds = placements.map((p) => p.id)

  const documents =
    placementIds.length > 0
      ? await db
          .select({
            id: placementDocument.id,
            placementId: placementDocument.placementId,
            type: placementDocument.type,
            status: placementDocument.status,
            verificationCode: placementDocument.verificationCode,
            locale: placementDocument.locale,
            borderStyle: placementDocument.borderStyle,
          })
          .from(placementDocument)
          .where(inArray(placementDocument.placementId, placementIds))
      : []

  const validatedByUserIds = placements
    .map((p) => p.validatedByUserId)
    .filter((id): id is string => id != null)

  const validators =
    validatedByUserIds.length > 0
      ? await db
          .select({ id: user.id, name: user.name })
          .from(user)
          .where(inArray(user.id, validatedByUserIds))
      : []

  const validatorNames = new Map(validators.map((v) => [v.id, v.name]))

  const slotsByInterview = new Map<string, typeof slots>()
  for (const slot of slots) {
    const existing = slotsByInterview.get(slot.interviewId) ?? []
    existing.push(slot)
    slotsByInterview.set(slot.interviewId, existing)
  }

  const interviewsByApp = new Map<string, typeof interviews>()
  for (const iv of interviews) {
    const existing = interviewsByApp.get(iv.applicationId) ?? []
    existing.push(iv)
    interviewsByApp.set(iv.applicationId, existing)
  }

  const placementsByApp = new Map<string, (typeof placements)[number]>()
  for (const pl of placements) {
    placementsByApp.set(pl.applicationId, pl)
  }

  const documentsByPlacement = new Map<string, typeof documents>()
  for (const doc of documents) {
    const existing = documentsByPlacement.get(doc.placementId) ?? []
    existing.push(doc)
    documentsByPlacement.set(doc.placementId, existing)
  }

  return applications.map((app) => {
    const appInterviews = interviewsByApp.get(app.id) ?? []
    const appPlacement = placementsByApp.get(app.id) ?? null

    return {
      ...app,
      interviews: appInterviews.map((iv) => ({
        id: iv.id,
        status: iv.status,
        note: iv.note,
        confirmedSlotId: iv.confirmedSlotId,
        slots: slotsByInterview.get(iv.id) ?? [],
      })),
      placement: appPlacement
        ? {
            placementId: appPlacement.id,
            startDate: appPlacement.startDate,
            endDate: appPlacement.endDate,
            validatedAt: appPlacement.validatedAt,
            validatedByName:
              validatorNames.get(appPlacement.validatedByUserId ?? "") ?? null,
            documents: documentsByPlacement.get(appPlacement.id) ?? [],
          }
        : null,
    }
  })
}
