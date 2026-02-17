"use client"

import { Loader2 } from "lucide-react"

import { TimelineModal } from "@/components/TimelineModal"

import { useCandidates } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/hooks/useCandidates"
import { CandidatesHeader } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/CandidatesHeader"
import { PipelineGrid } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/PipelineGrid"
import { AcceptModal } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/AcceptModal"
import { RefuseModal } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/RefuseModal"

interface CandidatesViewProps {
  offerId: string
}

export function CandidatesView({ offerId }: CandidatesViewProps) {
  const {
    offer,
    applications,
    isLoading,
    isFetchingNextPage,
    grouped,
    sentinelRef,
    actionLoading,
    acceptModal,
    setAcceptModal,
    handleAccept,
    refuseModal,
    setRefuseModal,
    refuseNote,
    setRefuseNote,
    handleRefuse,
    handleStageChange,
    pendingStageById,
    openedTimelineFor,
    setOpenedTimelineFor,
    timelineData,
    isTimelineLoading,
  } = useCandidates(offerId)

  return (
    <div className="w-full space-y-8">
      <CandidatesHeader offerTitle={offer?.title} totalCandidates={applications.length} />

      <PipelineGrid
        applications={applications}
        grouped={grouped}
        isLoading={isLoading}
        offerId={offerId}
        actionLoading={actionLoading}
        pendingStageById={pendingStageById}
        onAccept={(app) =>
          setAcceptModal({
            applicationId: app.id,
            studentName: app.student.name || "Student",
          })
        }
        onRefuse={(app) =>
          setRefuseModal({
            applicationId: app.id,
            studentName: app.student.name || "Student",
          })
        }
        onStageChange={handleStageChange}
        onViewTimeline={setOpenedTimelineFor}
      />

      <div ref={sentinelRef} className="h-4" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {openedTimelineFor && (
        <TimelineModal
          events={timelineData}
          isLoading={isTimelineLoading}
          onClose={() => setOpenedTimelineFor(null)}
        />
      )}

      {acceptModal && (
        <AcceptModal
          studentName={acceptModal.studentName}
          applicationId={acceptModal.applicationId}
          actionLoading={actionLoading}
          onConfirm={handleAccept}
          onCancel={() => setAcceptModal(null)}
        />
      )}

      {refuseModal && (
        <RefuseModal
          studentName={refuseModal.studentName}
          applicationId={refuseModal.applicationId}
          actionLoading={actionLoading}
          refuseNote={refuseNote}
          onNoteChange={setRefuseNote}
          onConfirm={handleRefuse}
          onCancel={() => {
            setRefuseModal(null)
            setRefuseNote("")
          }}
        />
      )}
    </div>
  )
}
