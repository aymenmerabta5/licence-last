"use client"

import { X } from "lucide-react"
import { Label } from "@/components/ui/label"

interface Skill {
  id: string
  name: string
}

interface SelectedSkillsBarProps {
  selectedIds: string[]
  allSkills: Skill[]
  onToggle: (skillId: string) => void
}

export function SelectedSkillsBar({
  selectedIds,
  allSkills,
  onToggle,
}: SelectedSkillsBarProps) {
  return (
    <div className="space-y-2">
      <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        Selected skills
      </Label>
      <div className="flex flex-wrap gap-2">
        {selectedIds.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No skills selected yet.
          </p>
        ) : (
          selectedIds
            .map((id) => allSkills.find((s) => s.id === id))
            .filter(Boolean)
            .map((skill) => (
              <button
                key={skill!.id}
                type="button"
                onClick={() => onToggle(skill!.id)}
                className="inline-flex items-center gap-1.5 rounded-none border border-border bg-secondary/20 px-2.5 py-1 text-xs text-foreground hover:border-primary/30 hover:text-primary transition-colors"
                aria-label={`Remove ${skill!.name}`}
              >
                <span className="font-medium">{skill!.name}</span>
                <X className="h-3.5 w-3.5 opacity-70" />
              </button>
            ))
        )}
      </div>
    </div>
  )
}
