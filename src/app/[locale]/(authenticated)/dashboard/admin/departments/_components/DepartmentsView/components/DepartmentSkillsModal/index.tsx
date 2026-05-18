"use client"

import { useTranslations } from "next-intl"

import { SkillsFooter } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/DepartmentSkillsModal/components/SkillsFooter"
import { SkillsMainSection } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/DepartmentSkillsModal/components/SkillsMainSection"
import { useDepartmentSkills } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/DepartmentSkillsModal/hooks/useDepartmentSkills"
import { useDepartmentSkillsModal } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/DepartmentSkillsModal/hooks/useDepartmentSkillsModal"
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
    assignedCategories,
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
  } = useDepartmentSkillsModal({
    toggleSkill,
    setQuery,
    createSkill,
    t,
    assignedCategoryCount: assignedCategories.length,
  })

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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {t("title", { name: departmentName })}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <SkillsMainSection
          departmentId={departmentId}
          assignedCategories={assignedCategories}
          isLoading={isLoading}
          query={query}
          setQuery={setQuery}
          draftIds={draftIds}
          groups={groups}
          categoryOrder={categoryOrder}
          categoryLabels={categoryLabels}
          toggleSkill={toggleSkill}
          toggleCategory={toggleCategory}
          showCategories={showCategories}
          toggleCategories={toggleCategories}
          similarSkills={similarSkills}
          dismissSimilar={dismissSimilar}
          isCreatingSkill={isCreatingSkill}
          handleCreateSkill={handleCreateSkill}
          handleForceCreate={handleForceCreate}
          handleUseExisting={handleUseExisting}
          hasExactMatch={hasExactMatch}
        />
        <SkillsFooter
          draftIds={draftIds}
          saveError={saveError}
          isSaving={isSaving}
          isDirty={isDirty}
          clearAll={clearAll}
          onCancel={() => handleOpenChange(false)}
          onSave={handleSave}
        />
      </DialogContent>
    </Dialog>
  )
}
