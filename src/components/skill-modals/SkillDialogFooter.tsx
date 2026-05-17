"use client"

import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

interface SkillDialogFooterProps {
  selectedCount: number
  skillsSelectedLabel: string
  saveError: string | null
  isSaving: boolean
  isDirty: boolean
  cancelLabel: string
  saveLabel: string
  onCancel: () => void
  onSave: () => void
}

export function SkillDialogFooter({
  selectedCount,
  skillsSelectedLabel,
  saveError,
  isSaving,
  isDirty,
  cancelLabel,
  saveLabel,
  onCancel,
  onSave,
}: SkillDialogFooterProps) {
  return (
    <div className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between flex">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground tabular-nums">
          {selectedCount} {skillsSelectedLabel}
        </span>
        {saveError && (
          <p className="text-[11px] text-destructive font-medium">
            {saveError}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-none"
          onClick={onCancel}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant="editorial"
          size="editorial-sm"
          className="rounded-none"
          onClick={onSave}
          disabled={isSaving || !isDirty}
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : saveLabel}
        </Button>
      </div>
    </div>
  )
}
