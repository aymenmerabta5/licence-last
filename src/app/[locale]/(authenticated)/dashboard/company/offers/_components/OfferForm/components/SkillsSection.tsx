"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { Check } from "lucide-react"
import * as motion from "motion/react-client"
import { reveal, ease } from "@/lib/animations"
import { errorMessage } from "@/lib/schemas/auth"

import { groupSkillsByCategory, CATEGORY_ORDER } from "../utils"

interface SkillTag {
  id: string
  name: string
  category: string | null
}

interface SkillsSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
  skillTags: SkillTag[]
}

export function SkillsSection({ form, skillTags }: SkillsSectionProps) {
  const t = useTranslations("dashboard.company.offers.form")
  const groupedSkills = useMemo(
    () => groupSkillsByCategory(skillTags),
    [skillTags],
  )

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.6, ease, delay: 0.2 }}
      className="space-y-5"
    >
      <h2 className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground border-b border-border pb-2">
        {t("skillsSection")}
      </h2>
      <p className="text-xs text-muted-foreground">{t("skillsHint")}</p>

      <form.Field name="skillTagIds">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(field: any) => (
          <div className="space-y-4">
            {CATEGORY_ORDER.map((category) => {
              const skills = groupedSkills[category]
              if (!skills || skills.length === 0) return null

              return (
                <div key={category} className="space-y-2">
                  <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/70">
                    {t(
                      `skillCategory.${category}` as "skillCategory.frontend",
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => {
                      const isSelected = field.state.value.includes(skill.id)
                      const isAtMax = field.state.value.length >= 20

                      return (
                        <button
                          key={skill.id}
                          type="button"
                          disabled={!isSelected && isAtMax}
                          onClick={() => {
                            if (isSelected) {
                              field.handleChange(
                                field.state.value.filter(
                                  (id: string) => id !== skill.id,
                                ),
                              )
                            } else {
                              field.handleChange([
                                ...field.state.value,
                                skill.id,
                              ])
                            }
                          }}
                          className={`
                            inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-colors
                            ${
                              isSelected
                                ? "bg-primary/10 border-primary/30 text-primary font-medium"
                                : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                            }
                            ${!isSelected && isAtMax ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                          `}
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

            <p className="text-[11px] text-muted-foreground">
              {field.state.value.length}/20 {t("skillsSelected")}
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
        )}
      </form.Field>
    </motion.div>
  )
}
