"use client"

import { Button } from "@/components/ui/button"

interface LanguagesManagerHeaderProps {
  title: string
  description: string
  saveLabel: string
  isDisabled: boolean
  onSave: () => void
}

export function LanguagesManagerHeader({
  title,
  description,
  saveLabel,
  isDisabled,
  onSave,
}: LanguagesManagerHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1">
        <h3 className="font-serif text-lg text-heading">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="rounded-none"
        disabled={isDisabled}
        onClick={onSave}
      >
        {saveLabel}
      </Button>
    </div>
  )
}
