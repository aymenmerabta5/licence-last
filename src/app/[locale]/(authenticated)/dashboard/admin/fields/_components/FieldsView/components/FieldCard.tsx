import { Boxes, GraduationCap, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

interface FieldCardProps {
  id: string
  name: string
  slug: string
  description: string | null
  skillCount: number
  onManageSkills: (fieldId: string) => void
  onDelete: (fieldId: string) => void
}

export function FieldCard({
  id,
  name,
  description,
  skillCount,
  onManageSkills,
  onDelete,
}: FieldCardProps) {
  const t = useTranslations("dashboard.admin.fields")

  const handleDelete = () => {
    if (window.confirm(t("deleteConfirm"))) {
      onDelete(id)
    }
  }

  return (
    <article className="border border-border/60 bg-card/30 dark:bg-card/50 p-5 sm:p-6 transition-colors hover:border-primary/30">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border/50 bg-muted/30 mt-0.5">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 space-y-2">
            <h3 className="truncate font-serif text-xl leading-tight text-heading">
              {name}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium border border-border/50 text-muted-foreground">
                {skillCount} {t("manageSkills")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto shrink-0">
          <Button
            type="button"
            variant="editorial-outline"
            size="editorial-sm"
            onClick={() => onManageSkills(id)}
          >
            <Boxes className="h-3.5 w-3.5 me-1.5" />
            {t("manageSkills")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </article>
  )
}
