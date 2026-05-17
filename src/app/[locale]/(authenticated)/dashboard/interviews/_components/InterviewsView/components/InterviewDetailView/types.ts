export interface InterviewDetailViewProps {
  interview: {
    id: string
    applicationId: string
    offerId: string
    offerTitle: string
    companyId: string
    companyName: string
    companyLogoUrl: string | null
    status:
      | "pending_confirmation"
      | "confirmed"
      | "cancelled"
      | "completed"
      | "reschedule_requested"
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
}

export interface ConfirmSlotInput {
  interviewId: string
  slotId: string
}
