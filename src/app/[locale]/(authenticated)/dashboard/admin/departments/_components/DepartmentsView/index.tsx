"use client"

import { useState } from "react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { FolderTree, Loader2 } from "lucide-react"

import { reveal, revealWithDelay } from "@/lib/animations"

import { useDepartmentsActions } from "./hooks/useDepartmentsActions"
import { useAssignHeadDialog } from "./hooks/useAssignHeadDialog"
import { useDepartmentsData } from "./hooks/useDepartmentsData"
import { AssignHeadDialog } from "./components/AssignHeadDialog"
import { BulkCreateForm } from "./components/BulkCreateForm"
import { CreateDepartmentForm } from "./components/CreateDepartmentForm"
import { DepartmentCard } from "./components/DepartmentCard"
import { DepartmentsHeader } from "./components/DepartmentsHeader"
import { DepartmentSkillsModal } from "./components/DepartmentSkillsModal"

export function DepartmentsView() {
  const t = useTranslations("dashboard.admin.departments")

  const { universityId, departments, isLoading } = useDepartmentsData()
  const actions = useDepartmentsActions()

  const [skillsModalDeptId, setSkillsModalDeptId] = useState<string | null>(null)
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
                onAssignHead={assignHeadDialog.open}
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
    </div>
  )
}
