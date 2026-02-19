"use client"

import { CompanyStatusFilter } from "@/app/[locale]/(authenticated)/dashboard/admin/companies/_components/CompanyValidationList/components/CompanyStatusFilter"
import { CompanyValidationContent } from "@/app/[locale]/(authenticated)/dashboard/admin/companies/_components/CompanyValidationList/components/CompanyValidationContent"
import { CompanyValidationHeader } from "@/app/[locale]/(authenticated)/dashboard/admin/companies/_components/CompanyValidationList/components/CompanyValidationHeader"
import { RejectDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/companies/_components/CompanyValidationList/components/RejectDialog"
import { useCompanyValidation } from "@/app/[locale]/(authenticated)/dashboard/admin/companies/_components/CompanyValidationList/hooks/useCompanyValidation"
import { useCompanyValidationState } from "@/app/[locale]/(authenticated)/dashboard/admin/companies/_components/CompanyValidationList/hooks/useCompanyValidationState"

export function CompanyValidationList() {
  const {
    companies,
    isLoading,
    statusFilter,
    setStatusFilter,
    approveCompany,
    isApproving,
    rejectCompany,
    isRejecting,
    suspendCompany,
    isSuspending,
    reactivateCompany,
    isReactivating,
  } = useCompanyValidation()
  const state = useCompanyValidationState()

  function handleRejectConfirm(reason: string) {
    if (!state.rejectingId) return
    rejectCompany(
      { companyId: state.rejectingId, reason },
      { onSuccess: () => state.handleRejectDialogChange(false) },
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4 md:px-0">
      <CompanyValidationHeader total={companies.length} />

      <CompanyStatusFilter
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <CompanyValidationContent
        companies={companies}
        isLoading={isLoading}
        onApprove={approveCompany}
        onReject={state.handleRejectClick}
        onSuspend={suspendCompany}
        onReactivate={reactivateCompany}
        isApproving={isApproving}
        isRejecting={isRejecting}
        isSuspending={isSuspending}
        isReactivating={isReactivating}
      />

      <RejectDialog
        open={state.rejectDialogOpen}
        onOpenChange={state.handleRejectDialogChange}
        onConfirm={handleRejectConfirm}
        isRejecting={isRejecting}
      />
    </div>
  )
}
