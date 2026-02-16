"use client"

import { useTranslations } from "next-intl"
import { CheckCircle2, Loader2, Search } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SkillCategoryGrid } from "@/components/SkillCategoryGrid"

import { useDepartmentSkills } from "./hooks/useDepartmentSkills"

interface DepartmentSkillsModalProps {
  departmentId: string
  departmentName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DepartmentSkillsModal({
  departmentId,
  departmentName,
  open,
  onOpenChange,
}: DepartmentSkillsModalProps) {
  const t = useTranslations("dashboard.admin.departments.skills")

  const {
    query,
    setQuery,
    draftIds,
    isLoading,
    isSaving,
    isDirty,
    saveError,
    saveTick,
    groups,
    categoryOrder,
    categoryLabels,
    toggleSkill,
    save,
    resetState,
  } = useDepartmentSkills(departmentId, open)

  const handleOpenChange = (next: boolean) => {
    if (!next) resetState()
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {t("title", { name: departmentName })}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full ps-9 pe-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Scrollable skill grid */}
        <div className="flex-1 overflow-y-auto space-y-4 min-h-0 py-2">
          <SkillCategoryGrid
            groups={groups}
            categoryOrder={categoryOrder}
            categoryLabels={categoryLabels}
            selectedIds={draftIds}
            maxSkills={200}
            isLoading={isLoading}
            onToggle={toggleSkill}
          />
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground tabular-nums">
              {draftIds.length} {t("skillsSelected")}
            </span>
            {saveError && (
              <p className="text-[11px] text-destructive font-medium">
                {saveError}
              </p>
            )}
            {saveTick > 0 && !saveError && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {t("saveSuccess")}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="editorial"
              size="editorial-sm"
              onClick={save}
              disabled={isSaving || !isDirty}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("save")
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
