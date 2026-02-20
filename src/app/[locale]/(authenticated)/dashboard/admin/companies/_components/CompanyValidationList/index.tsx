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
    isFetchingNextPage,
    sentinelRef,
    hasMore,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
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
    <div className="max-w-7xl mx-auto pb-20 px-4 md:px-0 space-y-10">
      <CompanyValidationHeader total={companies.length} />

      <CompanyStatusFilter
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        search={search}
        onSearchChange={setSearch}
      />

      <CompanyValidationContent
        companies={companies}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasMore={hasMore}
        sentinelRef={sentinelRef}
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
