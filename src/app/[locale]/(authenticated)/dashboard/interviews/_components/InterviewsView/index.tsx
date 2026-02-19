"use client"

import { useEffect } from "react"

import { useInterviewsData } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/hooks/useInterviewsData"
import { useInterviewsState } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/hooks/useInterviewsState"
import { CompanyInterviewsSection } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/CompanyInterviewsSection"
import { CompanyProposeForm } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/CompanyProposeForm"
import { FeatureDisabledCard } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/FeatureDisabledCard"
import { InterviewsHeader } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewsHeader"
import { StudentInterviewsSection } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/StudentInterviewsSection"
import type { InterviewsRole } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"

interface InterviewsViewProps {
  role: InterviewsRole
}

export function InterviewsView({ role }: InterviewsViewProps) {
  const state = useInterviewsState()
  const data = useInterviewsData({
    role,
    selectedOfferId: state.selectedOfferId,
  })
  const applicationId = state.applicationId
  const setApplicationId = state.setApplicationId
  const companyApplications = data.companyApplications
  const isApplicationsLoading = data.isApplicationsLoading

  useEffect(() => {
    if (role !== "company_admin" || !applicationId || isApplicationsLoading) {
      return
    }

    const hasSelectedApplication = companyApplications.some(
      (application) => application.id === applicationId,
    )
    if (!hasSelectedApplication) {
      setApplicationId("")
    }
  }, [applicationId, companyApplications, isApplicationsLoading, role, setApplicationId])

  const submitProposal = async () => {
    const didSubmit = await data.proposeSlots({
      applicationId: state.applicationId,
      note: state.note,
      slots: state.slots,
    })

    if (didSubmit) {
      state.resetProposalForm()
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      <InterviewsHeader role={role} />

      {data.isFeatureDisabled ? (
        <FeatureDisabledCard />
      ) : role === "student" ? (
        <StudentInterviewsSection
          interviews={data.studentInterviews}
          isLoading={data.isStudentLoading}
          errorMessage={data.studentErrorMessage}
          confirmingSlotId={data.confirmingSlotId}
          onConfirmSlot={data.confirmSlot}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 items-start">
          <CompanyProposeForm
            offers={data.companyOffers}
            applications={data.companyApplications}
            selectedOfferId={state.selectedOfferId}
            applicationId={state.applicationId}
            note={state.note}
            slots={state.slots}
            canSubmit={state.canSubmitProposal}
            isSubmitting={data.isSubmittingProposal}
            isOffersLoading={data.isOffersLoading}
            isApplicationsLoading={data.isApplicationsLoading}
            onOfferChange={state.selectOffer}
            onApplicationIdChange={state.setApplicationId}
            onNoteChange={state.setNote}
            onSlotChange={state.updateSlot}
            onAddSlot={state.addSlot}
            onRemoveSlot={state.removeSlot}
            onSubmit={submitProposal}
          />

          <CompanyInterviewsSection
            interviews={data.companyInterviews}
            isLoading={data.isCompanyLoading}
            errorMessage={data.companyErrorMessage}
          />
        </div>
      )}
    </div>
  )
}
