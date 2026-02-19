"use client"

import { StudentInfoCard } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/components/StudentInfoCard"
import { CompanyOfferCard } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/components/CompanyOfferCard"
import { AISummaryPanel } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/components/AISummaryPanel"
import { ValidationForm } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/components/ValidationForm"
import { buildValidationSummaryInput } from "@/app/[locale]/(authenticated)/dashboard/dept-validations/[applicationId]/_components/DeptHeadPlacementDetail/utils"
import type {
  DeptHeadPlacementActions,
  DeptHeadPlacementApplication,
} from "@/app/[locale]/(authenticated)/dashboard/dept-validations/[applicationId]/_components/DeptHeadPlacementDetail/types"

interface DeptHeadPlacementContentProps {
  application: DeptHeadPlacementApplication
  actions: DeptHeadPlacementActions
}

export function DeptHeadPlacementContent({
  application,
  actions,
}: DeptHeadPlacementContentProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <StudentInfoCard application={application} />
      <CompanyOfferCard application={application} />

      <AISummaryPanel
        aiSummary={actions.aiSummary}
        isSummarizing={actions.isSummarizing}
        summaryError={actions.summaryError}
        onGenerate={() => {
          actions.generateAiSummary(buildValidationSummaryInput(application))
        }}
      />

      <ValidationForm
        startDate={actions.startDate}
        onStartDateChange={actions.setStartDate}
        endDate={actions.endDate}
        onEndDateChange={actions.setEndDate}
        expectedStartDate={actions.expectedStartDate}
        expectedEndDate={actions.expectedEndDate}
        showOutOfRangeWarning={actions.showOutOfRangeWarning}
        actionLoading={actions.actionLoading}
        pdfLoading={actions.pdfLoading}
        onValidate={actions.handleValidate}
        onOpenReject={() => actions.setRejectModal(true)}
      />
    </div>
  )
}
