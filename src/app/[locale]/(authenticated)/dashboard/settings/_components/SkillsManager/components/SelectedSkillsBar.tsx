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

function isSkill(skill: Skill | undefined): skill is Skill {
  return Boolean(skill)
}

export function SelectedSkillsBar({
  selectedIds,
  allSkills,
  onToggle,
}: SelectedSkillsBarProps) {
  return (
    <div className="space-y-2.5">
      <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
        Your skills
      </Label>

      {selectedIds.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/40 bg-secondary/5 px-4 py-3">
          <p className="text-xs text-muted-foreground/60">
            No skills selected yet. Browse categories below to add skills.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {selectedIds
            .map((id) => allSkills.find((s) => s.id === id))
            .filter(isSkill)
            .map((skill) => (
              <button
                key={skill.id}
                type="button"
                onClick={() => onToggle(skill.id)}
                className="group inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                aria-label={`Remove ${skill.name}`}
              >
                {skill.name}
                <X className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
