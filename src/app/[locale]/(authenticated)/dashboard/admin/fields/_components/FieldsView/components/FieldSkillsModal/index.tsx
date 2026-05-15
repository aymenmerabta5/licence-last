"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { useFieldSkills } from "@/app/[locale]/(authenticated)/dashboard/admin/fields/_components/FieldsView/components/FieldSkillsModal/hooks/useFieldSkills"
import { SkillCategoryGrid } from "@/components/SkillCategoryGrid"
import { SkillCreateRow } from "@/components/skill-modals/SkillCreateRow"
import { SkillDialogFooter } from "@/components/skill-modals/SkillDialogFooter"
import { SkillSearchInput } from "@/components/skill-modals/SkillSearchInput"
import { SkillSimilarSuggestions } from "@/components/skill-modals/SkillSimilarSuggestions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

        <SkillSearchInput
          query={query}
          onChange={(value) => {
            setQuery(value)
            if (similarSkills) setSimilarSkills(null)
          }}
          placeholder={t("searchPlaceholder")}
        />

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
            <SkillCreateRow
              isCreating={isCreatingSkill}
              onCreate={handleCreateSkill}
              label={t("skillNotFound", { query: queryTrimmed })}
              createLabel={t("createSkill", { name: queryTrimmed })}
            />
          )}

          {similarSkills && (
            <SkillSimilarSuggestions
              skills={similarSkills}
              isCreating={isCreatingSkill}
              onUseExisting={handleUseExisting}
              onForceCreate={handleForceCreate}
              onCancel={() => setSimilarSkills(null)}
              didYouMeanLabel={t("didYouMean")}
              cancelLabel={t("cancel")}
              createAnywayLabel={t("createAnyway")}
            />
          )}
        </div>

        <SkillDialogFooter
          selectedCount={draftIds.length}
          skillsSelectedLabel={t("skillsSelected")}
          saveError={saveError}
          isSaving={isSaving}
          isDirty={isDirty}
          cancelLabel={t("cancel")}
          saveLabel={t("save")}
          onCancel={() => handleOpenChange(false)}
          onSave={handleSave}
        />
      </DialogContent>
    </Dialog>
  )
}
