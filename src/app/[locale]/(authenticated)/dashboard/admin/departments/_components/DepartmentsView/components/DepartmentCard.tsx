import { useTranslations } from "next-intl"
import { FolderTree, UserCheck } from "lucide-react"

interface DepartmentCardProps {
  department: {
    id: string
    name: string
    headName: string | null
    createdAt: Date | string
  }
  onAssignHead: (departmentId: string) => void
}

export function DepartmentCard({ department, onAssignHead }: DepartmentCardProps) {
  const t = useTranslations("dashboard.departments")

  return (
    <div className="border border-border p-5 flex items-start justify-between gap-4">
      <div className="flex items-start gap-4 min-w-0">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <FolderTree className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-serif text-lg text-heading">{department.name}</p>
          {department.headName && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <UserCheck className="h-3.5 w-3.5" />
              {department.headName}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onAssignHead(department.id)}
        className="text-xs text-primary hover:underline whitespace-nowrap"
      >
        {t("assignHead")}
      </button>
    </div>
  )
}
