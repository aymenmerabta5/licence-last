"use client"

import { Boxes, Loader2 } from "lucide-react"

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
    <section className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Boxes className="h-4 w-4 text-primary" />
          </span>
          <div>
            <h3 className="font-serif text-lg text-heading leading-tight">
              Skill Stack
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Select up to {maxSkills} skills to improve your match score.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 ps-11 sm:ps-0">
          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 rounded-full bg-secondary/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${(selectedIds.length / maxSkills) * 100}%` }}
              />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
              {selectedIds.length}/{maxSkills}
            </span>
          </div>

          <Button
            type="button"
            variant="editorial"
            size="editorial-sm"
            className="h-9"
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
