"use client"

import { RejectDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/components/RejectDialog"
import { DeptHeadPlacementContent } from "@/app/[locale]/(authenticated)/dashboard/dept-validations/[applicationId]/_components/DeptHeadPlacementDetail/components/DeptHeadPlacementContent"
import { DeptHeadPlacementHeader } from "@/app/[locale]/(authenticated)/dashboard/dept-validations/[applicationId]/_components/DeptHeadPlacementDetail/components/DeptHeadPlacementHeader"
import { ValidateConfirmationDialog } from "@/app/[locale]/(authenticated)/dashboard/dept-validations/[applicationId]/_components/DeptHeadPlacementDetail/components/ValidateConfirmationDialog"
import { useDeptHeadPlacementActions } from "@/app/[locale]/(authenticated)/dashboard/dept-validations/[applicationId]/_components/DeptHeadPlacementDetail/hooks/useDeptHeadPlacementActions"
import { useDeptHeadPlacementData } from "@/app/[locale]/(authenticated)/dashboard/dept-validations/[applicationId]/_components/DeptHeadPlacementDetail/hooks/useDeptHeadPlacementData"

export function DeptHeadPlacementDetail({
  applicationId,
}: {
  applicationId: string
}) {
  const { application, isLoading } = useDeptHeadPlacementData(applicationId)
  const actions = useDeptHeadPlacementActions(applicationId, {
    expectedStartDate: application?.offer.expectedStartDate,
    expectedEndDate: application?.offer.expectedEndDate,
  })

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <DeptHeadPlacementHeader
        isLoading={isLoading}
        hasApplication={!!application}
        studentName={application?.student.name}
        companyName={application?.company.name}
      />

      {application && (
        <DeptHeadPlacementContent application={application} actions={actions} />
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
    </div>
  )
}
