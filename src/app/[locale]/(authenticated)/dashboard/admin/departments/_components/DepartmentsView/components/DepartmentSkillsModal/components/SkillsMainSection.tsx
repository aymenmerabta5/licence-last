"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import { useTranslations } from "next-intl"

import { DepartmentCategoryConfig } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/DepartmentCategoryConfig"
import { SkillsBody } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/DepartmentSkillsModal/components/SkillsBody"

interface Skill {
  id: string
  name: string
}

interface SkillsMainSectionProps {
  departmentId: string
  assignedCategories: Array<{ id: number; name: string; slug: string }>
  isLoading: boolean
  query: string
  setQuery: (value: string) => void
  draftIds: string[]
  groups: Record<string, Skill[]>
  categoryOrder: readonly string[]
  categoryLabels: Record<string, string>
  toggleSkill: (skillId: string) => void
  toggleCategory: (category: string, skillIds: string[]) => void
  showCategories: boolean
  toggleCategories: () => void
  similarSkills: Array<{ id: string; name: string }> | null
  dismissSimilar: () => void
  isCreatingSkill: boolean
  handleCreateSkill: (query: string) => void
  handleForceCreate: (query: string) => void
  handleUseExisting: (skillId: string) => void
  hasExactMatch: boolean
}

export function SkillsMainSection({
  departmentId,
  assignedCategories,
  isLoading,
  query,
  setQuery,
  draftIds,
  groups,
  categoryOrder,
  categoryLabels,
  toggleSkill,
  toggleCategory,
  showCategories,
  toggleCategories,
  similarSkills,
  dismissSimilar,
  isCreatingSkill,
  handleCreateSkill,
  handleForceCreate,
  handleUseExisting,
  hasExactMatch,
}: SkillsMainSectionProps) {
  const hasCategories = assignedCategories.length > 0
  const t = useTranslations("dashboard.admin.departments.skills")

  return (
    <>
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
      <SkillsBody
        hasCategories={hasCategories}
        isLoading={isLoading}
        query={query}
        setQuery={setQuery}
        draftIds={draftIds}
        groups={groups}
        categoryOrder={categoryOrder}
        categoryLabels={categoryLabels}
        toggleSkill={toggleSkill}
        toggleCategory={toggleCategory}
        similarSkills={similarSkills}
        dismissSimilar={dismissSimilar}
        isCreatingSkill={isCreatingSkill}
        handleCreateSkill={handleCreateSkill}
        handleForceCreate={handleForceCreate}
        handleUseExisting={handleUseExisting}
        hasExactMatch={hasExactMatch}
        toggleCategories={toggleCategories}
      />
    </>
  )
}
