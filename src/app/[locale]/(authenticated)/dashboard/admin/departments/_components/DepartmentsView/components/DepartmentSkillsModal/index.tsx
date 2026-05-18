"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import { useTranslations } from "next-intl"

import { DepartmentCategoryConfig } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/DepartmentCategoryConfig"
import { useDepartmentSkills } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/DepartmentSkillsModal/hooks/useDepartmentSkills"
import { useDepartmentSkillsModal } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/DepartmentSkillsModal/hooks/useDepartmentSkillsModal"
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
    toggleCategory,
    clearAll,
    save,
    resetState,
    createSkill,
    isCreatingSkill,
  } = useDepartmentSkills(departmentId, open)

  const {
    similarSkills,
    showCategories,
    dismissSimilar,
    toggleCategories,
    resetModal,
    handleCreateSkill,
    handleForceCreate,
    handleUseExisting,
  } = useDepartmentSkillsModal({ toggleSkill, setQuery, createSkill, t })

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      resetState()
      resetModal()
    }
    onOpenChange(next)
  }

  const handleSave = async () => {
    handleOpenChange(false)
    if (await save()) {
      // toast handled inside save hook or could be added here
    }
  }

  const queryTrimmed = query.trim()
  const showCreateOption =
    queryTrimmed.length > 0 && !isLoading && !hasExactMatch && !similarSkills

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {t("title", { name: departmentName })}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <button
          type="button"
          onClick={toggleCategories}
          className="flex items-center justify-between w-full text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          <span>{t("manageCategories")}</span>
          {showCategories ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
        {showCategories && (
          <DepartmentCategoryConfig departmentId={departmentId} />
        )}
        <SkillSearchInput
          query={query}
          onChange={(value) => {
            setQuery(value)
            if (similarSkills) dismissSimilar()
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
            onToggleCategory={toggleCategory}
            selectAllLabel={t("selectAll")}
            deselectAllLabel={t("deselectAll")}
            selectRemainingLabel={t("selectRemaining")}
          />
          {showCreateOption && (
            <SkillCreateRow
              isCreating={isCreatingSkill}
              onCreate={() => handleCreateSkill(queryTrimmed)}
              label={t("skillNotFound", { query: queryTrimmed })}
              createLabel={t("createSkill", { name: queryTrimmed })}
            />
          )}
          {similarSkills && (
            <SkillSimilarSuggestions
              skills={similarSkills}
              isCreating={isCreatingSkill}
              onUseExisting={handleUseExisting}
              onForceCreate={() => handleForceCreate(queryTrimmed)}
              onCancel={dismissSimilar}
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
          clearLabel={t("clearAll")}
          onCancel={() => handleOpenChange(false)}
          onSave={handleSave}
          onClearAll={clearAll}
        />
      </DialogContent>
    </Dialog>
  )
}
