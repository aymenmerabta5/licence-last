"use client"

import { Check, Search, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import type { OfferFormApi } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm/hooks/useOfferForm"
import { FormSection } from "@/components/form-fields"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { useSkillGrouping } from "@/hooks"
import { errorMessage } from "@/lib/schemas/auth"
import { cn } from "@/lib/utils"

interface SkillTag {
  id: string
  name: string
  slug: string
  category: string | null
}

interface SkillsSectionProps {
  form: OfferFormApi
  skillTags: SkillTag[]
}

const MAX_SKILLS = 20

function isSkillTag(skill: SkillTag | undefined): skill is SkillTag {
  return Boolean(skill)
}

export function SkillsSection({ form, skillTags }: SkillsSectionProps) {
  const t = useTranslations("dashboard.company.offers.form")
  const [query, setQuery] = useState("")

  const filteredSkills = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return skillTags
    return skillTags.filter((s) => s.name.toLowerCase().includes(q))
  }, [skillTags, query])

  const { groups, categoryOrder, categoryLabels } =
    useSkillGrouping(filteredSkills)

  return (
    <FormSection title={t("skillsSection")} delay={0.2}>
      <p className="text-xs text-muted-foreground">{t("skillsHint")}</p>

      <form.Field name="skillTagIds">
        {(field) => {
          const selectedIds: string[] = field.state.value
          const isAtMax = selectedIds.length >= MAX_SKILLS

          function toggle(skillId: string) {
            const isSelected = selectedIds.includes(skillId)
            if (isSelected) {
              field.handleChange(
                selectedIds.filter((id: string) => id !== skillId),
              )
            } else if (!isAtMax) {
              field.handleChange([...selectedIds, skillId])
            }
          }

          return (
            <div className="space-y-4">
              {/* Search */}
              <InputGroup className="rounded-none h-10">
                <InputGroupAddon align="inline-start">
                  <Search className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="skill-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("skillsSearchPlaceholder")}
                />
              </InputGroup>

              {/* Selected skills bar */}
              {selectedIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedIds
                    .map((id) => skillTags.find((s) => s.id === id))
                    .filter(isSkillTag)
                    .map((skill) => (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => toggle(skill.id)}
                        className="group inline-flex items-center gap-1 border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                        aria-label={`Remove ${skill.name}`}
                      >
                        {skill.name}
                        <X className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                </div>
              )}

              {/* At-max warning */}
              {isAtMax && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                  {t("skillsMaxReached")}
                </p>
              )}

              {/* Category grid */}
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
                        const disabled = !isSelected && isAtMax

                        return (
                          <button
                            key={skill.id}
                            type="button"
                            disabled={disabled}
                            onClick={() => toggle(skill.id)}
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-all duration-200",
                              isSelected
                                ? "bg-primary/10 border-primary/25 text-primary font-semibold shadow-sm shadow-primary/5"
                                : "border-border/40 text-muted-foreground hover:border-primary/20 hover:text-foreground hover:bg-secondary/20",
                              disabled &&
                                "opacity-30 cursor-not-allowed hover:bg-transparent hover:border-border/40 hover:text-muted-foreground",
                            )}
                          >
                            {isSelected && (
                              <Check className="h-3 w-3 shrink-0" />
                            )}
                            {skill.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {/* Counter */}
              <p className="text-[11px] text-muted-foreground">
                {selectedIds.length}/{MAX_SKILLS} {t("skillsSelected")}
              </p>

              {field.state.meta.errors.length > 0 && (
                <p
                  className="text-destructive text-[11px] tracking-wide"
                  role="alert"
                >
                  {errorMessage(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )
        }}
      </form.Field>
    </FormSection>
  )
}
