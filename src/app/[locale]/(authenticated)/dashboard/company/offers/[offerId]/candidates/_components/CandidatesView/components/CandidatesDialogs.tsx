"use client"

import { AcceptModal } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/AcceptModal"
import { RefuseModal } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/RefuseModal"
import type {
  AcceptModalState,
  RefuseModalState,
} from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/types"
import { TimelineModal } from "@/components/TimelineModal"

interface TimelineEvent {
  id: string
  eventType: string
  fromStage: string | null
  toStage: string | null
  createdAt: string | Date
}

interface CandidatesDialogsProps {
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
  onRefuseNoteChange: (value: string) => void
  onConfirmRefuse: () => void
  onCloseRefuse: () => void
}

export function CandidatesDialogs({
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
}: CandidatesDialogsProps) {
  return (
    <>
      {openedTimelineFor ? (
        <TimelineModal
          events={timelineData}
          isLoading={isTimelineLoading}
          onClose={onCloseTimeline}
        />
      ) : null}

      {acceptModal ? (
        <AcceptModal
          studentName={acceptModal.studentName}
          applicationId={acceptModal.applicationId}
          actionLoading={actionLoading}
          onConfirm={onConfirmAccept}
          onCancel={onCloseAccept}
        />
      ) : null}

      {refuseModal ? (
        <RefuseModal
          studentName={refuseModal.studentName}
          applicationId={refuseModal.applicationId}
          actionLoading={actionLoading}
          refuseNote={refuseNote}
          onNoteChange={onRefuseNoteChange}
          onConfirm={onConfirmRefuse}
          onCancel={onCloseRefuse}
        />
      ) : null}
    </>
  )
}
