"use client"

import { SkillCategoryGrid } from "@/components/SkillCategoryGrid"

interface Skill {
  id: string
  name: string
}

interface SkillGrouping {
  groups: Record<string, Skill[]>
  categoryOrder: readonly string[]
  categoryLabels: Record<string, string>
}

interface SkillsGroupsPanelProps {
  hasDeptSkills: boolean
  deptGrouping: SkillGrouping
  otherGrouping: SkillGrouping
  selectedIds: string[]
  maxSkills: number
  isLoadingSkills: boolean
  onToggleSkill: (skillId: string) => void
}

export function SkillsGroupsPanel({
  hasDeptSkills,
  deptGrouping,
  otherGrouping,
  selectedIds,
  maxSkills,
  isLoadingSkills,
  onToggleSkill,
}: SkillsGroupsPanelProps) {
  return (
    <div className="space-y-4">
      {hasDeptSkills && (
        <>
          <p className="text-[11px] font-semibold text-primary">
            Recommended for your department
          </p>
          <SkillCategoryGrid
            groups={deptGrouping.groups}
            categoryOrder={deptGrouping.categoryOrder}
            categoryLabels={deptGrouping.categoryLabels}
            selectedIds={selectedIds}
            maxSkills={maxSkills}
            isLoading={isLoadingSkills}
            onToggle={onToggleSkill}
          />
          <div className="border-t border-border/50" />
          <p className="text-[11px] font-semibold text-muted-foreground">Other skills</p>
        </>
      )}

      <SkillCategoryGrid
        groups={otherGrouping.groups}
        categoryOrder={otherGrouping.categoryOrder}
        categoryLabels={otherGrouping.categoryLabels}
        selectedIds={selectedIds}
        maxSkills={maxSkills}
        isLoading={isLoadingSkills}
        onToggle={onToggleSkill}
      />
    </div>
  )
}
