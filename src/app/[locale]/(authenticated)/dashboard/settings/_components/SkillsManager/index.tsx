"use client"

import { SelectedSkillsBar } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SkillsManager/components/SelectedSkillsBar"
import { SkillSearch } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SkillsManager/components/SkillSearch"
import { SkillsGroupsPanel } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SkillsManager/components/SkillsGroupsPanel"
import { SkillsManagerHeader } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SkillsManager/components/SkillsManagerHeader"
import { useSkillsManager } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SkillsManager/hooks/useSkillsManager"

export function SkillsManager() {
  const {
    query,
    setQuery,
    selectedIds,
    allSkills,
    isLoadingSkills,
    isBusy,
    isAtMax,
    isDirty,
    isSaving,
    saveError,
    saveTick,
    groups,
    categoryOrder,
    categoryLabels,
    recommendedCategorySlugs,
    toggleSkill,
    save,
    maxSkills,
    sentinelRef,
    isFetchingNextPage,
  } = useSkillsManager()

  return (
    <section className="space-y-5">
      <SkillsManagerHeader
        selectedCount={selectedIds.length}
        maxSkills={maxSkills}
        isBusy={isBusy}
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={save}
      />

      <SelectedSkillsBar
        selectedIds={selectedIds}
        allSkills={allSkills}
        onToggle={toggleSkill}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_2fr]">
        <SkillSearch
          query={query}
          onQueryChange={setQuery}
          isLoading={isLoadingSkills}
          isAtMax={isAtMax}
          saveError={saveError}
          saveTick={saveTick}
        />

        <SkillsGroupsPanel
          groups={groups}
          categoryOrder={categoryOrder}
          categoryLabels={categoryLabels}
          recommendedCategorySlugs={recommendedCategorySlugs}
          selectedIds={selectedIds}
          maxSkills={maxSkills}
          isLoadingSkills={isLoadingSkills}
          onToggleSkill={toggleSkill}
          sentinelRef={sentinelRef}
          isFetchingNextPage={isFetchingNextPage}
        />
      </div>
    </section>
  )
}
