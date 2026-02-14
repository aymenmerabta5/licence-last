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
      <div className="rounded-2xl border border-border/30 bg-secondary/5 p-6">
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
          <div key={category} className="space-y-2.5">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground/60">
              {categoryLabels[category] ?? category}
            </p>
            <div className="flex flex-wrap gap-1.5">
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
                      "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-lg transition-all duration-200",
                      isSelected
                        ? "bg-primary/10 border-primary/25 text-primary font-semibold shadow-sm shadow-primary/5"
                        : "border-border/40 text-muted-foreground hover:border-primary/20 hover:text-foreground hover:bg-secondary/20",
                      disabled && "opacity-30 cursor-not-allowed hover:bg-transparent hover:border-border/40 hover:text-muted-foreground",
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 shrink-0" />}
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
