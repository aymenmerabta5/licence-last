export interface JourneySlot {
  id: string
  startsAt: Date | string
  endsAt: Date | string
  location: string | null
  meetingUrl: string | null
}

export interface JourneyInterview {
  id: string
  status: string
  note: string | null
  confirmedSlotId: string | null
  slots: JourneySlot[]
}

export interface JourneyDocument {
  id: string
  type: "agreement" | "certificate"
  status: string
  verificationCode: string | null
}

export interface JourneyPlacement {
  placementId: string
  startDate: Date | string
  endDate: Date | string
  validatedAt: Date | string
  validatedByName: string | null
  documents: JourneyDocument[]
}

export interface ApplicationJourney {
  id: string
  status: string
  pipelineStage: string
  coverLetter?: string | null
  createdAt: string | Date
  offerId: string
  offerTitle: string
  offerInternshipType: string
  offerWorkMode: string | null
  offerWilayaCode: number | null
  companyName: string
  companySlug: string
  companyLogoUrl: string | null
  interviews: JourneyInterview[]
  placement: JourneyPlacement | null
}
