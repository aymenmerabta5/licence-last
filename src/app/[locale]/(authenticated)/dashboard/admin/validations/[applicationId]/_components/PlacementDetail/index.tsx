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
import { usePlacementActions } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/hooks/usePlacementActions"
import { usePlacementData } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/hooks/usePlacementData"

export function PlacementDetailClient({
  applicationId,
}: {
  applicationId: string
}) {
  const t = useTranslations("dashboard.admin.validations.detail")
  const { application, isLoading } = usePlacementData(applicationId)
  const actions = usePlacementActions(applicationId, {
    expectedStartDate: application?.offer.expectedStartDate,
    expectedEndDate: application?.offer.expectedEndDate,
  })

  return (
    <ValidationDetailLayout
      isLoading={isLoading}
      hasApplication={!!application}
      studentName={application?.student.name}
      companyName={application?.company.name}
      backHref="/dashboard/admin/validations"
      backLabel={t("backToList")}
      title={t("title")}
      notFoundLabel={t("notFound")}
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
    </ValidationDetailLayout>
  )
}
