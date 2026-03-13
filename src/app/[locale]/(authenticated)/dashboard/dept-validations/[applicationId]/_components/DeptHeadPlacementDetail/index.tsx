"use client"

import { useTranslations } from "next-intl"
import {
  AISummaryPanel,
  buildValidationSummaryInput,
  CompanyOfferCard,
  RejectDialog,
  StudentInfoCard,
  ValidationDetailLayout,
  ValidationForm,
} from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations"
import { ValidateConfirmationDialog } from "@/app/[locale]/(authenticated)/dashboard/dept-validations/[applicationId]/_components/DeptHeadPlacementDetail/components/ValidateConfirmationDialog"
import { useDeptHeadPlacementActions } from "@/app/[locale]/(authenticated)/dashboard/dept-validations/[applicationId]/_components/DeptHeadPlacementDetail/hooks/useDeptHeadPlacementActions"
import { useDeptHeadPlacementData } from "@/app/[locale]/(authenticated)/dashboard/dept-validations/[applicationId]/_components/DeptHeadPlacementDetail/hooks/useDeptHeadPlacementData"

export function DeptHeadPlacementDetail({
  applicationId,
}: {
  applicationId: string
}) {
  const detailT = useTranslations("dashboard.admin.validations.detail")
  const listT = useTranslations("dashboard.admin.deptValidations")
  const { application, isLoading } = useDeptHeadPlacementData(applicationId)
  const actions = useDeptHeadPlacementActions(applicationId, {
    expectedStartDate: application?.offer.expectedStartDate,
    expectedEndDate: application?.offer.expectedEndDate,
  })

  return (
    <ValidationDetailLayout
      isLoading={isLoading}
      hasApplication={!!application}
      studentName={application?.student.name}
      companyName={application?.company.name}
      backHref="/dashboard/dept-validations"
      backLabel={listT("backToDashboard")}
      title={detailT("title")}
      notFoundLabel={detailT("notFound")}
    >
      {application && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <StudentInfoCard application={application} />
          <CompanyOfferCard application={application} />

          <AISummaryPanel
            aiSummary={actions.aiSummary}
            isSummarizing={actions.isSummarizing}
            summaryError={actions.summaryError}
            onGenerate={() =>
              actions.generateAiSummary(buildValidationSummaryInput(application))
            }
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
      )}

      {actions.rejectModal && (
        <RejectDialog
          studentName={application?.student.name || "Student"}
          rejectReason={actions.rejectReason}
          onRejectReasonChange={actions.setRejectReason}
          actionLoading={actions.actionLoading}
          onConfirm={actions.handleReject}
          onClose={() => {
            actions.setRejectModal(false)
            actions.setRejectReason("")
          }}
        />
      )}

      <ValidateConfirmationDialog
        open={actions.validateModal}
        onOpenChange={actions.setValidateModal}
        onConfirm={actions.handleConfirmValidate}
        isLoading={actions.actionLoading || actions.pdfLoading}
      />
    </ValidationDetailLayout>
  )
}
