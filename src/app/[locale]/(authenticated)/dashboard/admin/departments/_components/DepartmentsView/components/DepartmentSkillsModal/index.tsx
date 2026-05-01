"use client"

import { Loader2, Plus, Search } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { useDepartmentSkills } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/DepartmentSkillsModal/hooks/useDepartmentSkills"
import { SkillCategoryGrid } from "@/components/SkillCategoryGrid"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
    groups,
    categoryOrder,
    categoryLabels,
    hasExactMatch,
    toggleSkill,
    save,
    resetState,
    createSkill,
    isCreatingSkill,
  } = useDepartmentSkills(departmentId, open)

  const handleOpenChange = (next: boolean) => {
    if (!next) resetState()
    onOpenChange(next)
  }

  const handleSave = async () => {
    handleOpenChange(false)
    const isSuccess = await save()
    if (isSuccess) {
      toast.success(t("saveSuccess"))
    }
  }

  const handleCreateSkill = async () => {
    if (!query.trim()) return
    try {
      const newSkill = await createSkill(query.trim())
      toast.success(t("createSkillSuccess", { name: newSkill.name }))
      toggleSkill(newSkill.id)
      setQuery("")
    } catch {
      toast.error(t("createSkillError"))
    }
  }

  const queryTrimmed = query.trim()
  const showCreateOption =
    queryTrimmed.length > 0 && !isLoading && !hasExactMatch

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

          {showCreateOption && (
            <div className="flex items-center justify-between border border-dashed border-border/60 bg-muted/20 dark:bg-muted/10 px-4 py-3">
              <p className="text-sm text-muted-foreground">
                {t("skillNotFound", { query: queryTrimmed })}
              </p>
              <Button
                type="button"
                variant="editorial-outline"
                size="editorial-sm"
                onClick={handleCreateSkill}
                disabled={isCreatingSkill}
                className="gap-2 rounded-none"
              >
                {isCreatingSkill ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                {t("createSkill", { name: queryTrimmed })}
              </Button>
            </div>
          )}
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
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none"
              onClick={() => handleOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="editorial"
              size="editorial-sm"
              className="rounded-none"
              onClick={handleSave}
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
