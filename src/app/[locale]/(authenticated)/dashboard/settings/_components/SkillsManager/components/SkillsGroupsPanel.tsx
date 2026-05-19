"use client"

import { Loader2 } from "lucide-react"

import { SkillCategoryGrid } from "@/components/SkillCategoryGrid"

interface Skill {
  id: string
  name: string
}

interface SkillsGroupsPanelProps {
  groups: Record<string, Skill[]>
  categoryOrder: readonly string[]
  categoryLabels: Record<string, string>
  recommendedCategorySlugs: Set<string>
  selectedIds: string[]
  maxSkills: number
  isLoadingSkills: boolean
  onToggleSkill: (skillId: string) => void
  sentinelRef?: React.RefObject<HTMLDivElement | null>
  isFetchingNextPage?: boolean
}

export function SkillsGroupsPanel({
  groups,
  categoryOrder,
  categoryLabels,
  recommendedCategorySlugs,
  selectedIds,
  maxSkills,
  isLoadingSkills,
  onToggleSkill,
  sentinelRef,
  isFetchingNextPage,
}: SkillsGroupsPanelProps) {
  const hasCategories = categoryOrder.length > 0

  return (
    <div className="space-y-4">
      {isLoadingSkills && !hasCategories ? (
        <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading skills...
        </div>
      ) : null}

      {hasCategories ? (
        <>
          <SkillCategoryGrid
            groups={groups}
            categoryOrder={categoryOrder}
            categoryLabels={categoryLabels}
            selectedIds={selectedIds}
            maxSkills={maxSkills}
            isLoading={false}
            onToggle={onToggleSkill}
            recommendedCategorySlugs={recommendedCategorySlugs}
            recommendedLabel="Recommended"
          />
          <div ref={sentinelRef} className="py-2">
            {isFetchingNextPage && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading more...
              </div>
            )}
          </div>
        </>
      ) : !isLoadingSkills ? (
        <p className="py-4 text-sm text-muted-foreground">
          No skills available yet.
        </p>
      ) : null}
    </div>
  )
}
