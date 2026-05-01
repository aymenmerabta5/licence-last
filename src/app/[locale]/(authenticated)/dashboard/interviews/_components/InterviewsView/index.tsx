"use client"

import * as motion from "motion/react-client"
import { useMemo } from "react"
import { CompanyInterviewsSection } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/CompanyInterviewsSection"
import { FeatureDisabledCard } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/FeatureDisabledCard"
import { InterviewsHeader } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewsHeader"
import { useInterviewsData } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/hooks/useInterviewsData"
import type { InterviewsRole } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { reveal, revealWithDelay } from "@/lib/animations"

interface InterviewsViewProps {
  role: InterviewsRole
}

export function InterviewsView({ role }: InterviewsViewProps) {
  const data = useInterviewsData({
    role,
    selectedOfferId: "",
  })

  const counts = useMemo(() => {
    const interviews = data.companyInterviews
    return {
      total: interviews.length,
      pending: interviews.filter(
        (interview) => interview.status === "pending_confirmation",
      ).length,
      confirmed: interviews.filter(
        (interview) => interview.status === "confirmed",
      ).length,
    }
  }, [data.companyInterviews])

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      <InterviewsHeader role={role} counts={counts} />

      {data.isFeatureDisabled ? (
        <FeatureDisabledCard />
      ) : (
        <motion.div {...reveal} transition={revealWithDelay(0.15)}>
          <CompanyInterviewsSection
            interviews={data.companyInterviews}
            isLoading={data.isCompanyLoading}
            errorMessage={data.companyErrorMessage}
          />
        </motion.div>
      )}
    </div>
  )
}
