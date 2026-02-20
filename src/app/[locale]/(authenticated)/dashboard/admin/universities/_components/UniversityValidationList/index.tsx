"use client"

import { DeleteUniversityDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/universities/_components/UniversityValidationList/components/DeleteUniversityDialog"
import { EditUniversityDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/universities/_components/UniversityValidationList/components/EditUniversityDialog"
import { RejectDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/universities/_components/UniversityValidationList/components/RejectDialog"
import { UniversityStatusFilter } from "@/app/[locale]/(authenticated)/dashboard/admin/universities/_components/UniversityValidationList/components/UniversityStatusFilter"
import { UniversityValidationContent } from "@/app/[locale]/(authenticated)/dashboard/admin/universities/_components/UniversityValidationList/components/UniversityValidationContent"
import { UniversityValidationHeader } from "@/app/[locale]/(authenticated)/dashboard/admin/universities/_components/UniversityValidationList/components/UniversityValidationHeader"
import { useUniversityValidation } from "@/app/[locale]/(authenticated)/dashboard/admin/universities/_components/UniversityValidationList/hooks/useUniversityValidation"
import { useUniversityValidationState } from "@/app/[locale]/(authenticated)/dashboard/admin/universities/_components/UniversityValidationList/hooks/useUniversityValidationState"
import type { UpdateUniversityPayload } from "@/app/[locale]/(authenticated)/dashboard/admin/universities/_components/UniversityValidationList/types"

export function UniversityValidationList() {
  const {
    universities,
    isLoading,
    isFetchingNextPage,
    sentinelRef,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    approveUniversity,
    isApproving,
    rejectUniversity,
    isRejecting,
    updateUniversity,
    isUpdating,
    deleteUniversity,
    isDeleting,
  } = useUniversityValidation()
  const state = useUniversityValidationState()

  function handleRejectConfirm(reason: string) {
    if (!state.rejectingId) return
    rejectUniversity(
      { universityId: state.rejectingId, reason },
      { onSuccess: () => state.handleRejectDialogChange(false) },
    )
  }

  function handleEditConfirm(payload: UpdateUniversityPayload) {
    updateUniversity(payload, {
      onSuccess: () => state.handleEditDialogChange(false),
    })
  }

  function handleDeleteConfirm(universityId: string) {
    deleteUniversity(
      { universityId },
      {
        onSuccess: () => state.handleDeleteDialogChange(false),
      },
    )
  }

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4 md:px-0 space-y-10">
      <UniversityValidationHeader total={universities.length} />

      <UniversityStatusFilter
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        search={search}
        onSearchChange={setSearch}
      />

      <UniversityValidationContent
        universities={universities}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        sentinelRef={sentinelRef}
        onApprove={approveUniversity}
        onReject={state.handleRejectClick}
        onEdit={state.handleEditClick}
        onDelete={state.handleDeleteClick}
        isApproving={isApproving}
        isRejecting={isRejecting}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
      />

      <RejectDialog
        open={state.rejectDialogOpen}
        onOpenChange={state.handleRejectDialogChange}
        onConfirm={handleRejectConfirm}
        isRejecting={isRejecting}
      />

      <EditUniversityDialog
        open={state.editDialogOpen}
        onOpenChange={state.handleEditDialogChange}
        university={state.editingUniversity}
        onConfirm={handleEditConfirm}
        isUpdating={isUpdating}
      />

      <DeleteUniversityDialog
        open={state.deleteDialogOpen}
        onOpenChange={state.handleDeleteDialogChange}
        university={state.deletingUniversity}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  )
}
