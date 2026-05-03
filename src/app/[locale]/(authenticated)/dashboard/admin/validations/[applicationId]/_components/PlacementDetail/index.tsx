"use client"

import { useTranslations } from "next-intl"
import {
  AISummaryPanel,
  buildValidationSummaryInput,
  CompanyOfferCard,
  StudentInfoCard,
  ValidationDetailLayout,
  ValidationForm,
} from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations"
import { RejectDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/components/RejectDialog"
import { ValidateDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/components/ValidateDialog"
import { usePlacementActions } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/hooks/usePlacementActions"
import { usePlacementData } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/hooks/usePlacementData"

function toDateInputValue(value: Date | string | null | undefined): string {
  if (!value) return ""
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().split("T")[0]
}

export function PlacementDetailClient({
  applicationId,
}: {
  applicationId: string
}) {
  const t = useTranslations("dashboard.admin.validations.detail")
  const { application, isLoading } = usePlacementData(applicationId)
  const actions = usePlacementActions(applicationId)

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
            expectedStartDate={toDateInputValue(application?.offer.expectedStartDate)}
            expectedEndDate={toDateInputValue(application?.offer.expectedEndDate)}
            actionLoading={actions.actionLoading}
            pdfLoading={actions.pdfLoading}
            onValidate={actions.handleValidate}
            onOpenReject={() => actions.setRejectModal(true)}
          />
        </div>
      )}

      <ValidateDialog
        open={actions.validateModal}
        onOpenChange={actions.setValidateModal}
        onConfirm={actions.handleConfirmValidate}
        isLoading={actions.actionLoading || actions.pdfLoading}
      />

      <RejectDialog
        open={actions.rejectModal}
        onOpenChange={actions.setRejectModal}
        studentName={application?.student.name || "Student"}
        onConfirm={actions.handleReject}
        isRejecting={actions.actionLoading}
      />
    </ValidationDetailLayout>
  )
}
