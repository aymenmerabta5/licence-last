export type InterviewsRole = "student" | "company_admin"

export type InterviewStatus = "pending_confirmation" | "confirmed" | "cancelled" | "completed"

export interface InterviewSlotView {
  id: string
  interviewId: string
  startsAt: Date | string
  endsAt: Date | string
  location: string | null
  meetingUrl: string | null
}

export interface StudentInterviewView {
  id: string
  applicationId: string
  offerId: string
  offerTitle: string
  companyId: string
  companyName: string
  companyLogoUrl: string | null
  status: InterviewStatus
  confirmedSlotId: string | null
  confirmedAt: Date | string | null
  note: string | null
  createdAt: Date | string
  updatedAt: Date | string
  slots: InterviewSlotView[]
}

export interface CompanyInterviewView {
  id: string
  applicationId: string
  offerId: string
  offerTitle: string
  studentUserId: string
  studentName: string | null
  studentImage: string | null
  status: InterviewStatus
  confirmedSlotId: string | null
  confirmedAt: Date | string | null
  note: string | null
  createdAt: Date | string
  updatedAt: Date | string
  slots: InterviewSlotView[]
}

export interface CompanyOfferOption {
  id: string
  title: string
}

export interface CompanyApplicationOption {
  id: string
  studentName: string
  pipelineStage: string
  createdAt: Date | string
}

export interface UseInterviewsDataParams {
  role: InterviewsRole
  selectedOfferId: string
}

export interface UseInterviewsDataResult {
  studentInterviews: StudentInterviewView[]
  companyInterviews: CompanyInterviewView[]
  companyOffers: CompanyOfferOption[]
  companyApplications: CompanyApplicationOption[]
  studentErrorMessage: string | null
  companyErrorMessage: string | null
  isStudentLoading: boolean
  isCompanyLoading: boolean
  isOffersLoading: boolean
  isApplicationsLoading: boolean
  confirmingSlotId: string | null
  isFeatureDisabled: boolean
  confirmSlot: (input: ConfirmSlotInput) => Promise<void>
}

export interface ProposedSlotDraft {
  id: string
  startsAt: string
  endsAt: string
  location: string
  meetingUrl: string
}

export interface ProposeSlotsInput {
  applicationId: string
  note: string
  slots: ProposedSlotDraft[]
}

export interface ConfirmSlotInput {
  interviewId: string
  slotId: string
}
