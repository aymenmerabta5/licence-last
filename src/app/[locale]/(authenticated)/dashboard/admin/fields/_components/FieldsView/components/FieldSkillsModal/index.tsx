"use client"

import { useState } from "react"
import { Loader2, Plus, Save, Search } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { useFieldSkills } from "@/app/[locale]/(authenticated)/dashboard/admin/fields/_components/FieldsView/components/FieldSkillsModal/hooks/useFieldSkills"
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

interface FieldSkillsModalProps {
  fieldId: string
  fieldName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FieldSkillsModal({
  fieldId,
  fieldName,
  open,
  onOpenChange,
}: FieldSkillsModalProps) {
  const t = useTranslations("dashboard.admin.fields.skills")
  const [similarSkills, setSimilarSkills] = useState<
    Array<{ id: string; name: string }> | null
  >(null)

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
  } = useFieldSkills(fieldId, open)

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      resetState()
      setSimilarSkills(null)
    }
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
      const result = await createSkill({ name: query.trim() })
      if ("status" in result && result.status === "similar_exists") {
        setSimilarSkills(result.similar)
        return
      }
      toast.success(t("createSkillSuccess", { name: result.name }))
      toggleSkill(result.id)
      setQuery("")
      setSimilarSkills(null)
    } catch {
      toast.error(t("createSkillError"))
    }
  }

  const handleForceCreate = async () => {
    if (!query.trim()) return
    try {
      const result = await createSkill({ name: query.trim(), force: true })
      if ("status" in result && result.status === "similar_exists") {
        setSimilarSkills(result.similar)
        return
      }
      toast.success(t("createSkillSuccess", { name: result.name }))
      toggleSkill(result.id)
      setQuery("")
      setSimilarSkills(null)
    } catch {
      toast.error(t("createSkillError"))
    }
  }

  const handleUseExisting = (skillId: string) => {
    toggleSkill(skillId)
    setSimilarSkills(null)
    setQuery("")
    toast.success(t("useExisting"))
  }

  const queryTrimmed = query.trim()
  const showCreateOption =
    queryTrimmed.length > 0 && !isLoading && !hasExactMatch && !similarSkills

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {t("title", { name: fieldName })}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (similarSkills) setSimilarSkills(null)
            }}
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

          {similarSkills && (
            <div className="space-y-3 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/40 px-4 py-3">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                {t("didYouMean")}
              </p>
              <div className="flex flex-wrap gap-2">
                {similarSkills.map((skill) => (
                  <Button
                    key={skill.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleUseExisting(skill.id)}
                    className="rounded-none"
                  >
                    {skill.name}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSimilarSkills(null)}
                  className="rounded-none"
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="button"
                  variant="editorial-outline"
                  size="editorial-sm"
                  onClick={handleForceCreate}
                  disabled={isCreatingSkill}
                  className="rounded-none gap-2"
                >
                  {isCreatingSkill ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  {t("createAnyway")}
                </Button>
              </div>
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
