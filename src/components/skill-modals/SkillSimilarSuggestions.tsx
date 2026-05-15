"use client"

import { Loader2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"

interface SimilarSkill {
  id: string
  name: string
}

interface SkillSimilarSuggestionsProps {
  skills: SimilarSkill[]
  isCreating: boolean
  onUseExisting: (skillId: string) => void
  onForceCreate: () => void
  onCancel: () => void
  didYouMeanLabel: string
  cancelLabel: string
  createAnywayLabel: string
}

export function SkillSimilarSuggestions({
  skills,
  isCreating,
  onUseExisting,
  onForceCreate,
  onCancel,
  didYouMeanLabel,
  cancelLabel,
  createAnywayLabel,
}: SkillSimilarSuggestionsProps) {
  return (
    <div className="space-y-3 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/40 px-4 py-3">
      <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
        {didYouMeanLabel}
      </p>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Button
            key={skill.id}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onUseExisting(skill.id)}
            className="rounded-none"
          >
            {skill.name}
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="rounded-none"
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant="editorial-outline"
          size="editorial-sm"
          onClick={onForceCreate}
          disabled={isCreating}
          className="rounded-none gap-2"
        >
          {isCreating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {createAnywayLabel}
        </Button>
      </div>
    </div>
  )
}
