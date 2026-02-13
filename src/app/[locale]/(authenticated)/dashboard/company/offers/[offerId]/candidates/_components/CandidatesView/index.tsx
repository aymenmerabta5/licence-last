"use client"

import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { TimelineModal } from "@/components/TimelineModal"

import { useCandidates } from "./hooks/useCandidates"
import { CandidatesHeader } from "./components/CandidatesHeader"
import { PipelineGrid } from "./components/PipelineGrid"
import { RefuseModal } from "./components/RefuseModal"

interface CandidatesViewProps {
  offerId: string
}

export function CandidatesView({ offerId }: CandidatesViewProps) {
  const t = useTranslations("dashboard.company.candidates")
  const {
    offer,
    applications,
    isLoading,
    isFetchingNextPage,
    grouped,
    sentinelRef,
    actionLoading,
    handleAccept,
    refuseModal,
    setRefuseModal,
    refuseNote,
    setRefuseNote,
    handleRefuse,
    handleStageChange,
    isStagePending,
    openedTimelineFor,
    setOpenedTimelineFor,
    timelineData,
    isTimelineLoading,
  } = useCandidates(offerId)

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <CandidatesHeader offerTitle={offer?.title} />

      <PipelineGrid
        applications={applications}
        grouped={grouped}
        isLoading={isLoading}
        offerId={offerId}
        actionLoading={actionLoading}
        isStagePending={isStagePending}
        onAccept={(appId) => handleAccept(appId, t("confirmAccept"))}
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
