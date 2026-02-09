"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Check, Loader2, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
import { useSkillGrouping } from "@/hooks"
import { orpc } from "@/server/orpc/client"

const MAX_SKILLS = 10

export function SkillsManager() {
  const queryClient = useQueryClient()

  const skillsQueryOptions = useMemo(
    () => orpc.skills.list.queryOptions(),
    [],
  )
  const profileQueryOptions = useMemo(
    () => orpc.students.getProfile.queryOptions(),
    [],
  )

  const { data: allSkills = [], isLoading: isLoadingSkills } = useQuery(
    skillsQueryOptions,
  )
  const { data: profileData, isLoading: isLoadingProfile } = useQuery(
    profileQueryOptions,
  )

  const initialSkillIds = useMemo(() => {
    const ids = profileData?.skills?.map((s) => s.id) ?? []
    return Array.from(new Set(ids))
  }, [profileData?.skills])

  const [query, setQuery] = useState("")
  const [draftSelectedIds, setDraftSelectedIds] = useState<string[] | null>(null)
  const [saveError, setSaveError] = useState<string>("")
  const [saveTick, setSaveTick] = useState(0)

  const selectedIds = draftSelectedIds ?? initialSkillIds

  const filteredSkills = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allSkills
    return allSkills.filter((s) => s.name.toLowerCase().includes(q))
  }, [allSkills, query])

  const { groups, categoryOrder, categoryLabels } = useSkillGrouping(filteredSkills)

  const upsertMutation = useMutation(
    orpc.students.upsertProfile.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: profileQueryOptions.queryKey })
        setDraftSelectedIds(null)
        setSaveTick((t) => t + 1)
      },
    }),
  )

  const isBusy = isLoadingSkills || isLoadingProfile || upsertMutation.isPending
  const isAtMax = selectedIds.length >= MAX_SKILLS
  const isDirty =
    draftSelectedIds !== null &&
    selectedIds.join(",") !== initialSkillIds.join(",")

  function toggleSkill(skillId: string) {
    setSaveError("")
    setSaveTick(0)

    setDraftSelectedIds((prev) => {
      const base = prev ?? initialSkillIds
      const isSelected = base.includes(skillId)
      if (isSelected) return base.filter((id) => id !== skillId)
      if (base.length >= MAX_SKILLS) return base
      return [...base, skillId]
    })
  }

  async function save() {
    setSaveError("")
    setSaveTick(0)

    if (selectedIds.length < 1) {
      setSaveError("Select at least 1 skill.")
      return
    }

    try {
      await upsertMutation.mutateAsync({ skillTagIds: selectedIds })
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save skills.")
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h3 className="font-serif text-lg text-heading">Skill Stack</h3>
          <p className="text-xs text-muted-foreground">
            Add up to {MAX_SKILLS} skills. These help match you to the right offers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-[11px] text-muted-foreground tabular-nums">
            {selectedIds.length}/{MAX_SKILLS} selected
          </p>
          <Button
            type="button"
            variant="editorial"
            size="editorial-sm"
            className="h-10"
            onClick={save}
            disabled={isBusy || !isDirty}
            aria-label="Save skills"
          >
            {upsertMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save skills"
            )}
          </Button>
        </div>
      </div>

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
                  onClick={() => toggleSkill(skill!.id)}
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-2">
          <Label
            htmlFor="skill-search"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
          >
            Find skills
          </Label>
        <div className="relative">
          <InputGroup className="rounded-none h-11">
            <InputGroupAddon align="inline-start">
              <Search className="h-4 w-4" />
            </InputGroupAddon>
            <InputGroupInput
              id="skill-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search e.g. React, Postgres, Docker..."
              disabled={isLoadingSkills}
            />
          </InputGroup>
        </div>
          {isAtMax && (
            <p className="text-[11px] text-muted-foreground">
              You reached the maximum. Remove a skill to add another.
            </p>
          )}
          {saveError && (
            <p className="text-[11px] text-destructive" role="alert">
              {saveError}
            </p>
          )}
          {saveTick > 0 && (
            <p className="text-[11px] text-muted-foreground">
              Saved.
            </p>
          )}
        </div>

        <div className="space-y-4">
          {isLoadingSkills ? (
            <div className="rounded-2xl border border-border/40 bg-secondary/10 p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading skills…
              </div>
            </div>
          ) : (
            categoryOrder.map((category) => {
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
                      const disabled = !isSelected && selectedIds.length >= MAX_SKILLS

                      return (
                        <button
                          key={skill.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => toggleSkill(skill.id)}
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
            })
          )}
        </div>
      </div>
    </section>
  )
}
