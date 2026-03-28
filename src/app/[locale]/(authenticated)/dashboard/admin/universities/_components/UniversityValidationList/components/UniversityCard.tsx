"use client"

import { Calendar, Check, Globe, MapPin, Pencil, Trash2, X } from "lucide-react"
import { useTranslations } from "next-intl"
import type { UniversityListItem } from "@/app/[locale]/(authenticated)/dashboard/admin/universities/_components/UniversityValidationList/types"
import { Button } from "@/components/ui/button"

const STATUS_STYLES: Record<string, string> = {
  pending:
    "bg-amber-50 text-amber-700 border-amber-400/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-500/40",
  approved:
    "bg-emerald-50 text-emerald-700 border-emerald-400/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/40",
  rejected:
    "bg-rose-50 text-rose-700 border-rose-400/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-500/40",
}

const STATUS_DOT: Record<string, string> = {
  pending: "bg-amber-500 dark:bg-amber-400",
  approved: "bg-emerald-500 dark:bg-emerald-400",
  rejected: "bg-rose-500 dark:bg-rose-400",
}

interface UniversityCardProps {
  university: UniversityListItem
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onEdit: (university: UniversityListItem) => void
  onDelete: (university: UniversityListItem) => void
  isApproving: boolean
  isRejecting: boolean
  isUpdating: boolean
  isDeleting: boolean
}

export function UniversityCard({
  university,
  onApprove,
  onReject,
  onEdit,
  onDelete,
  isApproving,
  isRejecting,
  isUpdating,
  isDeleting,
}: UniversityCardProps) {
  const t = useTranslations("dashboard.admin.universities")

  return (
    <div className="group relative border-b border-border/50 bg-background transition-colors hover:bg-muted/5">
      <div className="py-6 px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`inline-flex items-center gap-1.5 shrink-0 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] border ${
                    STATUS_STYLES[university.status] ?? STATUS_STYLES.pending
                  }`}
                >
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${STATUS_DOT[university.status] ?? STATUS_DOT.pending}`}
                  />
                  {t(`status.${university.status}`)}
                </span>
                {university.departmentName && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Globe className="h-3 w-3" />
                    {university.departmentName}
                  </span>
                )}
              </div>
              <h3 className="font-serif text-2xl font-bold text-heading tracking-tight flex items-baseline gap-2">
                {university.name}
                {university.abbreviation && (
                  <span className="text-base font-sans text-muted-foreground font-light">
                    {university.abbreviation}
                  </span>
                )}
              </h3>
            </div>

            {/* Info */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground/80">
              {university.city && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{university.city}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {new Date(university.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="shrink-0 flex flex-col items-stretch gap-2 min-w-[140px]">
            {university.status === "pending" && (
              <>
                <Button
                  type="button"
                  variant="editorial"
                  size="sm"
                  className="w-full justify-start h-9 rounded-sm font-medium"
                  disabled={isApproving}
                  onClick={() => onApprove(university.id)}
                >
                  <Check className="h-3.5 w-3.5 me-2" />
                  {t("approve")}
                </Button>
                <Button
                  type="button"
                  variant="editorial-outline"
                  size="sm"
                  className="w-full justify-start h-9 rounded-sm font-medium border-border/60 hover:border-black dark:hover:border-white"
                  disabled={isRejecting}
                  onClick={() => onReject(university.id)}
                >
                  <X className="h-3.5 w-3.5 me-2 text-red-500" />
                  {t("reject")}
                </Button>
                <div className="h-px w-full bg-border/40 my-1" />
              </>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start h-8 text-xs text-muted-foreground hover:text-foreground rounded-sm"
              disabled={isUpdating}
              onClick={() => onEdit(university)}
            >
              <Pencil className="h-3.5 w-3.5 me-2" />
              {t("edit")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start h-8 text-xs text-red-600/70 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-sm"
              disabled={isDeleting}
              onClick={() => onDelete(university)}
            >
              <Trash2 className="h-3.5 w-3.5 me-2" />
              {t("delete")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
