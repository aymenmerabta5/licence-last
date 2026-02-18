"use client"

import { useState } from "react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { FolderTree, Loader2 } from "lucide-react"

import { reveal, revealWithDelay } from "@/lib/animations"

import { useDepartmentsActions } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/hooks/useDepartmentsActions"
import { useAssignHeadDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/hooks/useAssignHeadDialog"
import { useDepartmentsData } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/hooks/useDepartmentsData"
import { AssignHeadDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/AssignHeadDialog"
import { BulkCreateForm } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/BulkCreateForm"
import { CreateDepartmentForm } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/CreateDepartmentForm"
import { DepartmentCard } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/DepartmentCard"
import { DeleteDepartmentDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/DeleteDepartmentDialog"
import { DepartmentsHeader } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/DepartmentsHeader"
import { DepartmentSkillsModal } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/DepartmentSkillsModal"
import { RemoveHeadDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/RemoveHeadDialog"
import type { DepartmentItem } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/types"

export function DepartmentsView() {
  const t = useTranslations("dashboard.admin.departments")

  const { universityId, departments, isLoading } = useDepartmentsData()
  const actions = useDepartmentsActions()

  const [skillsModalDeptId, setSkillsModalDeptId] = useState<string | null>(null)
  const [removeHeadTarget, setRemoveHeadTarget] = useState<DepartmentItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DepartmentItem | null>(null)
  const assignHeadDialog = useAssignHeadDialog({ onAssign: actions.assignHead })
  const hasUniversityContext = Boolean(universityId)

  const skillsModalDept = departments.find((dept) => dept.id === skillsModalDeptId)

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <DepartmentsHeader />

      <motion.div {...reveal} transition={revealWithDelay(0.08)}>
        <CreateDepartmentForm
          name={actions.newName}
          onNameChange={actions.setNewName}
          headName={actions.newHeadName}
          onHeadNameChange={actions.setNewHeadName}
          isCreating={actions.isCreating}
          onSubmit={actions.handleCreate}
        />
      </motion.div>

      <motion.div {...reveal} transition={revealWithDelay(0.12)}>
        <BulkCreateForm />
      </motion.div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && departments.length === 0 && (
        <motion.div
          {...reveal}
          transition={revealWithDelay(0.16)}
          className="space-y-2 border border-dashed border-border p-12 text-center"
        >
          <FolderTree className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        </motion.div>
      )}

      {hasUniversityContext && departments.length > 0 && (
        <div className="space-y-3">
          {departments.map((department, index) => (
            <motion.div
              key={department.id}
              {...reveal}
              transition={revealWithDelay(0.03 * index)}
            >
              <DepartmentCard
                department={department}
                onEditDepartment={async (target) => {
                  const nextName = window.prompt(t("name"), target.name)?.trim()
                  if (!nextName || nextName === target.name) return
                  try {
                    await actions.updateDepartment(target.id, { name: nextName })
                  } catch {
                    // Error feedback is handled by the mutation hook.
                  }
                }}
                onAssignHead={assignHeadDialog.open}
                onRemoveHead={setRemoveHeadTarget}
                onDeleteDepartment={setDeleteTarget}
                onManageSkills={setSkillsModalDeptId}
              />
            </motion.div>
          ))}
        </div>
      )}

      {skillsModalDept && (
        <DepartmentSkillsModal
          departmentId={skillsModalDept.id}
          departmentName={skillsModalDept.name}
          open={Boolean(skillsModalDeptId)}
          onOpenChange={(open) => {
            if (!open) setSkillsModalDeptId(null)
          }}
        />
      )}

      <AssignHeadDialog
        open={Boolean(assignHeadDialog.department)}
        departmentName={assignHeadDialog.department?.name ?? null}
        headName={assignHeadDialog.headName}
        onHeadNameChange={assignHeadDialog.setHeadName}
        headEmail={assignHeadDialog.headEmail}
        onHeadEmailChange={assignHeadDialog.setHeadEmail}
        onOpenChange={(open) => {
          if (!open) assignHeadDialog.close()
        }}
        onConfirm={assignHeadDialog.submit}
        isSaving={actions.isAssigningHead}
      />

      <RemoveHeadDialog
        open={Boolean(removeHeadTarget)}
        onOpenChange={(open) => !open && setRemoveHeadTarget(null)}
        department={removeHeadTarget}
        onConfirm={async (departmentId) => {
          try {
            await actions.unassignHead(departmentId)
            setRemoveHeadTarget(null)
          } catch {
            // Error feedback is handled by the mutation hook.
          }
        }}
        isPending={actions.isUnassigningHead}
      />

      <DeleteDepartmentDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        department={deleteTarget}
        onConfirm={async (departmentId) => {
          try {
            await actions.removeDepartment(departmentId)
            setDeleteTarget(null)
          } catch {
            // Error feedback is handled by the mutation hook.
          }
        }}
        isPending={actions.isDeletingDepartment}
      />
    </div>
  )
}
