"use client"

import { Loader2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

interface SkillCreateRowProps {
  isCreating: boolean
  onCreate: () => void
  label: string
  createLabel: string
}

export function SkillCreateRow({
  isCreating,
  onCreate,
  label,
  createLabel,
}: SkillCreateRowProps) {
  return (
    <div className="flex items-center justify-between border border-dashed border-border/60 bg-muted/20 dark:bg-muted/10 px-4 py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <Button
        type="button"
        variant="editorial-outline"
        size="editorial-sm"
        onClick={onCreate}
        disabled={isCreating}
        className="gap-2 rounded-none"
      >
        {isCreating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
        {createLabel}
      </Button>
    </div>
  )
}
