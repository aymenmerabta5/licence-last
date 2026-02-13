"use client"

import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

import { useSkillsManager } from "./hooks/useSkillsManager"
import { SelectedSkillsBar } from "./components/SelectedSkillsBar"
import { SkillSearch } from "./components/SkillSearch"
import { SkillCategoryGrid } from "./components/SkillCategoryGrid"

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
    toggleSkill,
    save,
    maxSkills,
  } = useSkillsManager()

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h3 className="font-serif text-lg text-heading">Skill Stack</h3>
          <p className="text-xs text-muted-foreground">
            Add up to {maxSkills} skills. These help match you to the right
            offers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-[11px] text-muted-foreground tabular-nums">
            {selectedIds.length}/{maxSkills} selected
          </p>
          <Button
            type="button"
            variant="editorial"
            size="editorial-sm"
            className="h-10"
            onClick={save}
            disabled={isBusy || !isDirty}
            aria-label="Save skills"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save skills"
            )}
          </Button>
        </div>
      </div>

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

        <div className="space-y-4">
          <SkillCategoryGrid
            groups={groups}
            categoryOrder={categoryOrder}
            categoryLabels={categoryLabels}
            selectedIds={selectedIds}
            maxSkills={maxSkills}
            isLoading={isLoadingSkills}
            onToggle={toggleSkill}
          />
        </div>
      </div>
    </section>
  )
}
