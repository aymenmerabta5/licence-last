"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { AssignHeadDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/AssignHeadDialog"
import { BulkCreateForm } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/BulkCreateForm"
import { CreateDepartmentForm } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/CreateDepartmentForm"
import { DeleteDepartmentDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/DeleteDepartmentDialog"
import { DepartmentSkillsModal } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/DepartmentSkillsModal"
import { DepartmentsHeader } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/DepartmentsHeader"
import { DepartmentsListSection } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/DepartmentsListSection"
import { EditDepartmentDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/EditDepartmentDialog"
import { RemoveHeadDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/RemoveHeadDialog"
import { useAssignHeadDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/hooks/useAssignHeadDialog"
import { useDepartmentsActions } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/hooks/useDepartmentsActions"
import { useDepartmentsData } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/hooks/useDepartmentsData"
import { useDepartmentsViewState } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/hooks/useDepartmentsViewState"
import { reveal, revealWithDelay } from "@/lib/animations"

export function DepartmentsView() {
  const t = useTranslations("dashboard.admin.departments")
  const {
    universityId,
    departments,
    isLoading,
    isSuperAdmin,
    universityOptions,
    selectedUniversityId,
    setSelectedUniversityId,
  } = useDepartmentsData()
  const actions = useDepartmentsActions(universityId)
  const assignHeadDialog = useAssignHeadDialog({ onAssign: actions.assignHead })
  const viewState = useDepartmentsViewState({ departments })
  const hasUniversityContext = Boolean(universityId)
  const emptyLabel = hasUniversityContext
    ? t("empty")
    : t("selectUniversityFirst")
  const handleEditDepartment = (departmentId: string, name: string) => {
    viewState.setEditTarget(null)
    actions.updateDepartment(departmentId, { name }).catch(() => {
      // Error feedback is handled by the mutation hook.
    })
  }
  const handleRemoveHead = (departmentId: string) => {
    viewState.setRemoveHeadTarget(null)
    actions.unassignHead(departmentId).catch(() => {
      // Error feedback is handled by the mutation hook.
    })
  }
  const handleDeleteDepartment = (departmentId: string) => {
    viewState.setDeleteTarget(null)
    actions.removeDepartment(departmentId).catch(() => {
      // Error feedback is handled by the mutation hook.
    })
  }
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      <DepartmentsHeader />
      <motion.div {...reveal} transition={revealWithDelay(0.08)}>
        <CreateDepartmentForm
          name={actions.newName}
          onNameChange={actions.setNewName}
          canCreate={actions.canCreate}
          showUniversitySelector={isSuperAdmin}
          selectedUniversityId={selectedUniversityId}
          universityOptions={universityOptions}
          onUniversityIdChange={setSelectedUniversityId}
          isCreating={actions.isCreating}
          onSubmit={actions.handleCreate}
        />
      </motion.div>
      <motion.div {...reveal} transition={revealWithDelay(0.12)}>
        <BulkCreateForm universityId={universityId} />
      </motion.div>
      <DepartmentsListSection
        departments={departments}
        isLoading={isLoading}
        hasUniversityContext={hasUniversityContext}
        emptyLabel={emptyLabel}
        onEditDepartment={viewState.setEditTarget}
        onAssignHead={assignHeadDialog.open}
        onRemoveHead={viewState.setRemoveHeadTarget}
        onDeleteDepartment={viewState.setDeleteTarget}
        onManageSkills={viewState.setSkillsModalDeptId}
      />
      {viewState.skillsModalDept && (
        <DepartmentSkillsModal
          departmentId={viewState.skillsModalDept.id}
          departmentName={viewState.skillsModalDept.name}
          open={Boolean(viewState.skillsModalDeptId)}
          onOpenChange={viewState.handleSkillsModalChange}
        />
      )}
      <EditDepartmentDialog
        open={Boolean(viewState.editTarget)}
        onOpenChange={viewState.handleEditOpenChange}
        department={viewState.editTarget}
        onConfirm={handleEditDepartment}
        isPending={actions.isUpdating}
      />
      <AssignHeadDialog
        open={Boolean(assignHeadDialog.department)}
        departmentName={assignHeadDialog.department?.name ?? null}
        headEmail={assignHeadDialog.headEmail}
        onHeadEmailChange={assignHeadDialog.setHeadEmail}
        onOpenChange={(open) => !open && assignHeadDialog.close()}
        onConfirm={assignHeadDialog.submit}
        isSaving={actions.isAssigningHead}
      />
      <RemoveHeadDialog
        open={Boolean(viewState.removeHeadTarget)}
        onOpenChange={viewState.handleRemoveHeadOpenChange}
        department={viewState.removeHeadTarget}
        onConfirm={handleRemoveHead}
        isPending={actions.isUnassigningHead}
      />
      <DeleteDepartmentDialog
        open={Boolean(viewState.deleteTarget)}
        onOpenChange={viewState.handleDeleteOpenChange}
        department={viewState.deleteTarget}
        onConfirm={handleDeleteDepartment}
        isPending={actions.isDeletingDepartment}
      />
    </div>
  )
}
