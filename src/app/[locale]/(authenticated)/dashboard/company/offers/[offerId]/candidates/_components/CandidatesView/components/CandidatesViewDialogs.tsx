"use client"

import { InterviewProposalModal } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/InterviewProposalModal"
import { CandidatesDialogs } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/CandidatesDialogs"
import type {
  AcceptModalState,
  RefuseModalState,
} from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/types"

interface TimelineEvent {
  id: string
  eventType: string
  fromStage: string | null
  toStage: string | null
  createdAt: string | Date
}

interface CandidatesViewDialogsProps {
  openedTimelineFor: string | null
  timelineData: TimelineEvent[]
  isTimelineLoading: boolean
  onCloseTimeline: () => void
  acceptModal: AcceptModalState | null
  actionLoading: string | null
  onConfirmAccept: () => void
  onCloseAccept: () => void
  refuseModal: RefuseModalState | null
  refuseNote: string
  onRefuseNoteChange: (note: string) => void
  onConfirmRefuse: () => void
  onCloseRefuse: () => void
  interviewModal: { applicationId: string; studentName: string; offerTitle: string } | null
  isProposingInterview: boolean
  onCloseInterview: () => void
  onSubmitInterview: (payload: {
    applicationId: string
    note?: string
    slots: Array<{
      startsAt: string
      endsAt: string
      location?: string
      meetingUrl?: string
    }>
  }) => Promise<void>
}

export function CandidatesViewDialogs({
  openedTimelineFor,
  timelineData,
  isTimelineLoading,
  onCloseTimeline,
  acceptModal,
  actionLoading,
  onConfirmAccept,
  onCloseAccept,
  refuseModal,
  refuseNote,
  onRefuseNoteChange,
  onConfirmRefuse,
  onCloseRefuse,
  interviewModal,
  isProposingInterview,
  onCloseInterview,
  onSubmitInterview,
}: CandidatesViewDialogsProps) {
  return (
    <>
      <CandidatesDialogs
        openedTimelineFor={openedTimelineFor}
        timelineData={timelineData}
        isTimelineLoading={isTimelineLoading}
        onCloseTimeline={onCloseTimeline}
        acceptModal={acceptModal}
        actionLoading={actionLoading}
        onConfirmAccept={onConfirmAccept}
        onCloseAccept={onCloseAccept}
        refuseModal={refuseModal}
        refuseNote={refuseNote}
        onRefuseNoteChange={onRefuseNoteChange}
        onConfirmRefuse={onConfirmRefuse}
        onCloseRefuse={onCloseRefuse}
      />

      <InterviewProposalModal
        applicationId={interviewModal?.applicationId ?? ""}
        studentName={interviewModal?.studentName ?? ""}
        offerTitle={interviewModal?.offerTitle ?? ""}
        isOpen={!!interviewModal}
        isSubmitting={isProposingInterview}
        onClose={onCloseInterview}
        onSubmit={onSubmitInterview}
      />
    </>
  )
}
