import {
  Boxes,
  FolderTree,
  Pencil,
  Trash2,
  UserCheck,
  UserMinus,
} from "lucide-react"
import { useTranslations } from "next-intl"
import type { DepartmentItem } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/types"
import { Button } from "@/components/ui/button"

interface DepartmentCardProps {
  department: DepartmentItem
  onEditDepartment: (department: DepartmentItem) => void
  onAssignHead: (department: DepartmentItem) => void
  onRemoveHead: (department: DepartmentItem) => void
  onDeleteDepartment: (department: DepartmentItem) => void
  onManageSkills: (departmentId: string) => void
}

export function DepartmentCard({
  department,
  onEditDepartment,
  onAssignHead,
  onRemoveHead,
  onDeleteDepartment,
  onManageSkills,
}: DepartmentCardProps) {
  const t = useTranslations("dashboard.admin.departments")
  const hasAssignedHead = Boolean(department.headUserId)
  const headLabel = department.headUserName ?? department.headUserEmail

  return (
    <article className="border border-border/60 bg-card/30 dark:bg-card/50 p-5 sm:p-6 transition-colors hover:border-primary/30">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border/50 bg-muted/30 mt-0.5">
            <FolderTree className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 space-y-2">
            <h3 className="truncate font-serif text-xl leading-tight text-heading">
              {department.name}
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium border border-border/50 text-muted-foreground">
                {department.skillCount} {t("manageSkills")}
              </span>
              {department.fieldName ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] border border-primary/30 bg-primary/5 text-primary">
                  {department.fieldName}
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground italic">
                  {t("noFieldAssigned")}
                </span>
              )}
              {hasAssignedHead && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] border border-emerald-400/60 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <UserCheck className="h-3 w-3" />
                  {headLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto shrink-0">
          <Button
            type="button"
            variant="editorial-ghost"
            size="editorial-sm"
            onClick={() => onEditDepartment(department)}
          >
            <Pencil className="h-3.5 w-3.5 me-1.5" />
            {t("editDepartment")}
          </Button>
          <Button
            type="button"
            variant="editorial-outline"
            size="editorial-sm"
            onClick={() => onManageSkills(department.id)}
          >
            <Boxes className="h-3.5 w-3.5 me-1.5" />
            {t("manageSkills")}
          </Button>
          {hasAssignedHead ? (
            <Button
              type="button"
              variant="editorial-ghost"
              size="editorial-sm"
              onClick={() => onRemoveHead(department)}
            >
              <UserMinus className="h-3.5 w-3.5 me-1.5" />
              {t("removeHead")}
            </Button>
          ) : (
            <Button
              type="button"
              variant="editorial"
              size="editorial-sm"
              onClick={() => onAssignHead(department)}
            >
              {t("assignHead")}
            </Button>
          )}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onDeleteDepartment(department)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </article>
  )
}
