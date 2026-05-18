"use client"

import { useTranslations } from "next-intl"

import { SkillDialogFooter } from "@/components/skill-modals/SkillDialogFooter"

interface SkillsFooterProps {
  draftIds: string[]
  saveError: string
  isSaving: boolean
  isDirty: boolean
  clearAll: () => void
  onCancel: () => void
  onSave: () => void
}

export function SkillsFooter({
  draftIds,
  saveError,
  isSaving,
  isDirty,
  clearAll,
  onCancel,
  onSave,
}: SkillsFooterProps) {
  const t = useTranslations("dashboard.admin.departments.skills")

  return (
    <SkillDialogFooter
      selectedCount={draftIds.length}
      skillsSelectedLabel={t("skillsSelected")}
      saveError={saveError}
      isSaving={isSaving}
      isDirty={isDirty}
      cancelLabel={t("cancel")}
      saveLabel={t("save")}
      clearLabel={t("clearAll")}
      onCancel={onCancel}
      onSave={onSave}
      onClearAll={clearAll}
    />
  )
}
