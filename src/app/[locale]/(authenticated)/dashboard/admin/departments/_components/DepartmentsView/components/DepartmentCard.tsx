import { useTranslations } from "next-intl"
import { Boxes, FolderTree, Trash2, UserCheck, UserMinus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import type { DepartmentItem } from "../types"

interface DepartmentCardProps {
  department: DepartmentItem
  onAssignHead: (department: DepartmentItem) => void
  onRemoveHead: (department: DepartmentItem) => void
  onDeleteDepartment: (department: DepartmentItem) => void
  onManageSkills: (departmentId: string) => void
}

export function DepartmentCard({
  department,
  onAssignHead,
  onRemoveHead,
  onDeleteDepartment,
  onManageSkills,
}: DepartmentCardProps) {
  const t = useTranslations("dashboard.admin.departments")

  return (
    <article className="group relative overflow-hidden border border-border/50 bg-background p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-sm sm:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/0 via-primary/70 to-primary/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FolderTree className="h-4 w-4" />
          </div>
          <div className="min-w-0 space-y-2">
            <h3 className="truncate font-serif text-xl leading-tight text-heading">
              {department.name}
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                {department.skillCount} {t("manageSkills")}
              </Badge>
              {department.headName ? (
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <UserCheck className="h-3 w-3" />
                  {department.headName}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            variant="editorial-outline"
            size="sm"
            onClick={() => onManageSkills(department.id)}
            className="rounded-lg px-3"
          >
            <Boxes className="h-3.5 w-3.5" />
            {t("manageSkills")}
          </Button>
          {department.headName ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onRemoveHead(department)}
              className="rounded-lg px-3"
            >
              <UserMinus className="h-3.5 w-3.5" />
              {t("removeHead")}
            </Button>
          ) : (
            <Button
              type="button"
              variant="editorial"
              size="sm"
              onClick={() => onAssignHead(department)}
              className="rounded-lg px-3"
            >
              {t("assignHead")}
            </Button>
          )}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onDeleteDepartment(department)}
            className="rounded-lg px-3"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t("deleteDepartment")}
          </Button>
        </div>
      </div>
    </article>
  )
}
