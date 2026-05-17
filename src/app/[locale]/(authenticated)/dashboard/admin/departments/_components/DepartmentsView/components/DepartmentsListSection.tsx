"use client"

import { FolderTree, Loader2 } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
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
  const t = useTranslations("dashboard.admin.departments")
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
          {t("loading")}
        </span>
      </div>
    )
  }

  if (departments.length === 0) {
    return (
      <motion.div
        {...reveal}
        transition={revealWithDelay(0.16)}
        className="border border-dashed border-border/60 p-12 text-center space-y-4"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center border border-border/50 bg-muted/30">
          <FolderTree className="h-6 w-6 text-muted-foreground/40" />
        </div>
        <div className="space-y-1">
          <p className="font-serif text-lg text-heading">
            {t("noDepartmentsTitle")}
          </p>
          <p className="text-sm font-light text-muted-foreground">
            {emptyLabel}
          </p>
        </div>
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
