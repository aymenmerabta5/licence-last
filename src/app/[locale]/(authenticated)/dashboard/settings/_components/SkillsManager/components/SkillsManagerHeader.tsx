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
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between pb-6 border-b border-border/20">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]">
          <Boxes className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-serif text-2xl tracking-tight text-heading">
            Professional Stack
          </h3>
          <p className="mt-1 text-sm text-muted-foreground/80 font-medium">
            Curate your competencies to increase your algorithmic match rate.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:items-end gap-3 ps-16 sm:ps-0 w-full sm:w-auto mt-4 sm:mt-0">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="h-2 w-full sm:w-32 overflow-hidden rounded-full bg-secondary shadow-inner">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700 ease-out shadow-[0_0_8px_var(--color-primary)]"
              style={{ width: `${(selectedCount / maxSkills) * 100}%` }}
            />
          </div>
          <span className="tabular-nums text-xs font-bold text-muted-foreground/60 w-12 text-end">
            {selectedCount}/{maxSkills}
          </span>
        </div>

        <Button
          type="button"
          variant="editorial"
          size="editorial-sm"
          className="h-10 px-6 rounded-xl shadow-md hover:shadow-lg transition-all shadow-primary/20 hover:shadow-primary/30 w-full sm:w-auto font-bold"
          onClick={onSave}
          disabled={isBusy || !isDirty}
          aria-label="Save skills"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-[spin_2s_linear_infinite]" />
          ) : (
            "Commit Skills"
          )}
        </Button>
      </div>
    </div>
  )
}
