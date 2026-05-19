"use client"

import { useTranslations } from "next-intl"

import { SkillCategoryGrid } from "@/components/SkillCategoryGrid"
import { Loader2 } from "lucide-react"
import { SkillCreateRow } from "@/components/skill-modals/SkillCreateRow"
import { SkillSearchInput } from "@/components/skill-modals/SkillSearchInput"
import { SkillSimilarSuggestions } from "@/components/skill-modals/SkillSimilarSuggestions"

interface Skill {
  id: string
  name: string
}

interface SkillsBodyProps {
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
  sentinelRef?: React.RefObject<HTMLDivElement | null>
  isFetchingNextPage?: boolean
}

export function SkillsBody({
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
  sentinelRef,
  isFetchingNextPage,
}: SkillsBodyProps) {
  const t = useTranslations("dashboard.admin.departments.skills")
  const queryTrimmed = query.trim()
  const showCreateOption =
    queryTrimmed.length > 0 && !isLoading && !hasExactMatch && !similarSkills

  return (
    <>
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
        <div ref={sentinelRef} className="py-2">
          {isFetchingNextPage && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {t("loadingMore")}
            </div>
          )}
        </div>
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
    </>
  )
}
