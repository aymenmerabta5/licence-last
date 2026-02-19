"use client"

import { Boxes, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

interface SkillsManagerHeaderProps {
  selectedCount: number
  maxSkills: number
  isBusy: boolean
  isDirty: boolean
  isSaving: boolean
  onSave: () => void
}

export function SkillsManagerHeader({
  selectedCount,
  maxSkills,
  isBusy,
  isDirty,
  isSaving,
  onSave,
}: SkillsManagerHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Boxes className="h-4 w-4 text-primary" />
        </span>
        <div>
          <h3 className="font-serif text-lg leading-tight text-heading">Skill Stack</h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Select up to {maxSkills} skills to improve your match score.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 ps-11 sm:ps-0">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary/30">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${(selectedCount / maxSkills) * 100}%` }}
            />
          </div>
          <span className="tabular-nums text-[11px] font-medium text-muted-foreground">
            {selectedCount}/{maxSkills}
          </span>
        </div>

        <Button
          type="button"
          variant="editorial"
          size="editorial-sm"
          className="h-9"
          onClick={onSave}
          disabled={isBusy || !isDirty}
          aria-label="Save skills"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save skills"}
        </Button>
      </div>
    </div>
  )
}
