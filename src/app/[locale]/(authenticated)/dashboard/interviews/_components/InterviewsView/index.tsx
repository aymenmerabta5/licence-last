"use client"

import { useEffect, useMemo } from "react"
import * as motion from "motion/react-client"
import { CompanyInterviewsSection } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/CompanyInterviewsSection"
import { CompanyProposeForm } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/CompanyProposeForm"
import { FeatureDisabledCard } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/FeatureDisabledCard"
import { InterviewsHeader } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewsHeader"
import { StudentInterviewsSection } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/StudentInterviewsSection"
import { useInterviewsData } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/hooks/useInterviewsData"
import { useInterviewsState } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/hooks/useInterviewsState"
import type { InterviewsRole } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { reveal, revealWithDelay } from "@/lib/animations"

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
  }, [
    applicationId,
    companyApplications,
    isApplicationsLoading,
    role,
    setApplicationId,
  ])

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

  const counts = useMemo(() => {
    const interviews =
      role === "student" ? data.studentInterviews : data.companyInterviews
    return {
      total: interviews.length,
      pending: interviews.filter(
        (i) => i.status === "pending_confirmation",
      ).length,
      confirmed: interviews.filter((i) => i.status === "confirmed").length,
    }
  }, [role, data.studentInterviews, data.companyInterviews])

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <InterviewsHeader role={role} counts={counts} />

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
        <motion.div
          {...reveal}
          transition={revealWithDelay(0.15)}
        >
          <Tabs defaultValue="schedule">
            <TabsList variant="line" className="mb-6">
              <TabsTrigger value="schedule">Schedule New</TabsTrigger>
              <TabsTrigger value="history">
                All Interviews
                {counts.total > 0 && (
                  <span className="ms-1.5 inline-flex h-5 min-w-5 items-center justify-center bg-muted px-1 text-[10px] font-bold text-muted-foreground">
                    {counts.total}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="schedule">
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 items-start">
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
            </TabsContent>

            <TabsContent value="history">
              <CompanyInterviewsSection
                interviews={data.companyInterviews}
                isLoading={data.isCompanyLoading}
                errorMessage={data.companyErrorMessage}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </div>
  )
}
