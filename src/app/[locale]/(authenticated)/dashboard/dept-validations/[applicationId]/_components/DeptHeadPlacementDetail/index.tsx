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

function toDateInputValue(value: Date | string | null | undefined): string {
  if (!value) return ""
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().split("T")[0]
}

export function DeptHeadPlacementDetail({
  applicationId,
}: {
  applicationId: string
}) {
  const detailT = useTranslations("dashboard.admin.validations.detail")
  const listT = useTranslations("dashboard.admin.deptValidations")
  const { application, isLoading } = useDeptHeadPlacementData(applicationId)
  const actions = useDeptHeadPlacementActions(applicationId)

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
              actions.generateAiSummary(
                buildValidationSummaryInput(application),
              )
            }
          />

          <ValidationForm
            expectedStartDate={toDateInputValue(
              application?.offer.expectedStartDate,
            )}
            expectedEndDate={toDateInputValue(
              application?.offer.expectedEndDate,
            )}
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
