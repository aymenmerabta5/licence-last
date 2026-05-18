"use client"

import { Layers } from "lucide-react"
import { useTranslations } from "next-intl"

import { SkillCategoryGrid } from "@/components/SkillCategoryGrid"
import { SkillCreateRow } from "@/components/skill-modals/SkillCreateRow"
import { SkillSearchInput } from "@/components/skill-modals/SkillSearchInput"
import { SkillSimilarSuggestions } from "@/components/skill-modals/SkillSimilarSuggestions"

interface Skill {
  id: string
  name: string
}

interface SkillsBodyProps {
  hasCategories: boolean
  isLoading: boolean
  query: string
  setQuery: (value: string) => void
  draftIds: string[]
  groups: Record<string, Skill[]>
  categoryOrder: readonly string[]
  categoryLabels: Record<string, string>
  toggleSkill: (skillId: string) => void
  toggleCategory: (category: string, skillIds: string[]) => void
  similarSkills: Array<{ id: string; name: string }> | null
  dismissSimilar: () => void
  isCreatingSkill: boolean
  handleCreateSkill: (query: string) => void
  handleForceCreate: (query: string) => void
  handleUseExisting: (skillId: string) => void
  hasExactMatch: boolean
  toggleCategories: () => void
}

export function SkillsBody({
  hasCategories,
  isLoading,
  query,
  setQuery,
  draftIds,
  groups,
  categoryOrder,
  categoryLabels,
  toggleSkill,
  toggleCategory,
  similarSkills,
  dismissSimilar,
  isCreatingSkill,
  handleCreateSkill,
  handleForceCreate,
  handleUseExisting,
  hasExactMatch,
  toggleCategories,
}: SkillsBodyProps) {
  const t = useTranslations("dashboard.admin.departments.skills")
  const queryTrimmed = query.trim()
  const showCreateOption =
    queryTrimmed.length > 0 && !isLoading && !hasExactMatch && !similarSkills

  return (
    <>
      {hasCategories && (
        <SkillSearchInput
          query={query}
          onChange={(value) => {
            setQuery(value)
            if (similarSkills) dismissSimilar()
          }}
          placeholder={t("searchPlaceholder")}
        />
      )}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0 py-2">
        {!hasCategories && !isLoading && (
          <div className="border border-dashed border-border/60 p-10 text-center space-y-4 rounded-lg">
            <div className="mx-auto flex h-14 w-14 items-center justify-center border border-border/50 bg-muted/30">
              <Layers className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <div className="space-y-2">
              <p className="font-serif text-lg text-heading">
                {t("noCategoriesTitle")}
              </p>
              <p className="text-sm font-light text-muted-foreground">
                {t("noCategoriesDescription")}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleCategories}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {t("manageCategories")}
            </button>
          </div>
        )}
        {hasCategories && (
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
        )}
        {showCreateOption && hasCategories && (
          <SkillCreateRow
            isCreating={isCreatingSkill}
            onCreate={() => handleCreateSkill(queryTrimmed)}
            label={t("skillNotFound", { query: queryTrimmed })}
            createLabel={t("createSkill", { name: queryTrimmed })}
          />
        )}
        {similarSkills && hasCategories && (
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
    </>
  )
}
