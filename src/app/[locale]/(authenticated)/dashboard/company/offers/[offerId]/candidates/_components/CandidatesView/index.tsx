"use client"

import { InterviewProposalModal } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/InterviewProposalModal"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { CandidatesDialogs } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/CandidatesDialogs"
import { CandidatesFilters } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/CandidatesFilters"
import { CandidatesHeader } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/CandidatesHeader"
import { PipelineGrid } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/PipelineGrid"
import { useCandidates } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/hooks/useCandidates"

interface CandidatesViewProps {
  offerId: string
}

export function CandidatesView({ offerId }: CandidatesViewProps) {
  const tExplore = useTranslations("dashboard.explore")
  const {
    offer,
    availableSkills,
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
    interviewModal,
    setInterviewModal,
    isProposingInterview,
    handleProposeInterview,
    handleStageChange,
    pendingStageById,
    openedTimelineFor,
    setOpenedTimelineFor,
    timelineData,
    isTimelineLoading,
    filters,
    hasActiveFilters,
    toggleSkill,
    toggleLanguage,
    clearFilters,
  } = useCandidates(offerId)

  return (
    <div className="w-full space-y-8">
      <CandidatesHeader
        offerTitle={offer?.title}
        totalCandidates={applications.length}
      />

      <CandidatesFilters
        skills={availableSkills}
        skillTagIds={filters.skillTagIds}
        languageCodes={filters.languageCodes}
        onToggleSkill={toggleSkill}
        onToggleLanguage={toggleLanguage}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
        tExplore={tExplore}
      />
      <PipelineGrid
        applications={applications}
        grouped={grouped}
        isLoading={isLoading}
        isFiltered={hasActiveFilters}
        offerId={offerId}
        actionLoading={actionLoading}
        pendingStageById={pendingStageById}
        onAccept={(app) => setAcceptModal({ applicationId: app.id, studentName: app.student.name || "Student" })}
        onRefuse={(app) => setRefuseModal({ applicationId: app.id, studentName: app.student.name || "Student" })}
        onInterview={(app) => setInterviewModal({ applicationId: app.id, studentName: app.student.name || "Student", offerTitle: offer?.title || "" })}
        onStageChange={handleStageChange}
        onViewTimeline={setOpenedTimelineFor}
      />
      <div ref={sentinelRef} className="h-4" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      <CandidatesDialogs
        openedTimelineFor={openedTimelineFor}
        timelineData={timelineData}
        isTimelineLoading={isTimelineLoading}
        onCloseTimeline={() => setOpenedTimelineFor(null)}
        acceptModal={acceptModal}
        actionLoading={actionLoading}
        onConfirmAccept={handleAccept}
        onCloseAccept={() => setAcceptModal(null)}
        refuseModal={refuseModal}
        refuseNote={refuseNote}
        onRefuseNoteChange={setRefuseNote}
        onConfirmRefuse={handleRefuse}
        onCloseRefuse={() => { setRefuseModal(null); setRefuseNote("") }}
      />

      <InterviewProposalModal
        applicationId={interviewModal?.applicationId ?? ""}
        studentName={interviewModal?.studentName ?? ""}
        offerTitle={interviewModal?.offerTitle ?? ""}
        isOpen={!!interviewModal}
        isSubmitting={isProposingInterview}
        onClose={() => setInterviewModal(null)}
        onSubmit={handleProposeInterview}
      />
    </div>
  )
}
