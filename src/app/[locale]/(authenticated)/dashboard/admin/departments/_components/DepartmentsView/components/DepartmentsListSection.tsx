"use client"

import { FolderTree, Loader2 } from "lucide-react"
import * as motion from "motion/react-client"
import { DepartmentCard } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/DepartmentCard"
import type { DepartmentItem } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/types"
import { reveal, revealWithDelay } from "@/lib/animations"

interface DepartmentsListSectionProps {
  departments: DepartmentItem[]
  isLoading: boolean
  hasUniversityContext: boolean
  emptyLabel: string
  onEditDepartment: (department: DepartmentItem) => void | Promise<void>
  onAssignHead: (department: DepartmentItem) => void
  onRemoveHead: (department: DepartmentItem) => void
  onDeleteDepartment: (department: DepartmentItem) => void
  onManageSkills: (departmentId: string) => void
}

export function DepartmentsListSection({
  departments,
  isLoading,
  hasUniversityContext,
  emptyLabel,
  onEditDepartment,
  onAssignHead,
  onRemoveHead,
  onDeleteDepartment,
  onManageSkills,
}: DepartmentsListSectionProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (departments.length === 0) {
    return (
      <motion.div
        {...reveal}
        transition={revealWithDelay(0.16)}
        className="space-y-2 border border-dashed border-border p-12 text-center"
      >
        <FolderTree className="mx-auto h-12 w-12 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      </motion.div>
    )
  }

  if (!hasUniversityContext) {
    return null
  }

  return (
    <div className="space-y-3">
      {departments.map((department, index) => (
        <motion.div
          key={department.id}
          {...reveal}
          transition={revealWithDelay(0.03 * index)}
        >
          <DepartmentCard
            department={department}
            onEditDepartment={onEditDepartment}
            onAssignHead={onAssignHead}
            onRemoveHead={onRemoveHead}
            onDeleteDepartment={onDeleteDepartment}
            onManageSkills={onManageSkills}
          />
        </motion.div>
      ))}
    </div>
  )
}
