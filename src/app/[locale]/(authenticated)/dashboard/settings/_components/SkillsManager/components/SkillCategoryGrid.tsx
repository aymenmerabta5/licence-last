"use client"

import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Skill {
  id: string
  name: string
}

interface SkillCategoryGridProps {
  groups: Record<string, Skill[]>
  categoryOrder: readonly string[]
  categoryLabels: Record<string, string>
  selectedIds: string[]
  maxSkills: number
  isLoading: boolean
  onToggle: (skillId: string) => void
}

export function SkillCategoryGrid({
  groups,
  categoryOrder,
  categoryLabels,
  selectedIds,
  maxSkills,
  isLoading,
  onToggle,
}: SkillCategoryGridProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/40 bg-secondary/10 p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading skills…
        </div>
      </div>
    )
  }

  return (
    <>
      {categoryOrder.map((category) => {
        const skills = groups[category]
        if (!skills || skills.length === 0) return null

        return (
          <div key={category} className="space-y-2">
            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/70">
              {categoryLabels[category] ?? category}
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => {
                const isSelected = selectedIds.includes(skill.id)
                const disabled = !isSelected && selectedIds.length >= maxSkills

                return (
                  <button
                    key={skill.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => onToggle(skill.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-colors rounded-none",
                      isSelected
                        ? "bg-primary/10 border-primary/30 text-primary font-medium"
                        : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
                      disabled && "opacity-40 cursor-not-allowed",
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    {skill.name}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </>
  )
}
