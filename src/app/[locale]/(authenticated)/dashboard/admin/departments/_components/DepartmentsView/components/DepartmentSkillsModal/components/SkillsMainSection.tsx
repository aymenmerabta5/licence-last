"use client"

import { SkillsBody } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/components/DepartmentSkillsModal/components/SkillsBody"

interface Skill {
  id: string
  name: string
}

interface SkillsMainSectionProps {
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

export function SkillsMainSection({
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
}: SkillsMainSectionProps) {
  return (
    <SkillsBody
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
      sentinelRef={sentinelRef}
      isFetchingNextPage={isFetchingNextPage}
    />
  )
}
