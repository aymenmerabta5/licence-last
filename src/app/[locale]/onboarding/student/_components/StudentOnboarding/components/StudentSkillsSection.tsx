"use client"

import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { useOnboardingSkills } from "@/app/[locale]/onboarding/student/_components/StudentOnboarding/hooks/useOnboardingSkills"
import type { OnboardingFormApi } from "@/app/[locale]/onboarding/student/_components/StudentOnboarding/components/types"
import { FormSection } from "@/components/form-fields"
import { SkillCategoryGrid } from "@/components/SkillCategoryGrid"
import { SkillSearchInput } from "@/components/skill-modals/SkillSearchInput"

interface StudentSkillsSectionProps {
  form: OnboardingFormApi
  skillsSectionIndex: string
  selectedDepartmentId: string
}

export function StudentSkillsSection({
  form,
  skillsSectionIndex,
  selectedDepartmentId,
}: StudentSkillsSectionProps) {
  const t = useTranslations("onboarding.student")
  const {
    query,
    setQuery,
    groups,
    categoryOrder,
    categoryLabels,
    recommendedCategorySlugs,
    isLoading,
    isFetchingNextPage,
    sentinelRef,
  } = useOnboardingSkills(selectedDepartmentId)

  const hasCategories = categoryOrder.length > 0

  return (
    <FormSection
      title={`${skillsSectionIndex} - ${t("skillsSection")}`}
      delay={0.18}
    >
      <SkillSearchInput
        query={query}
        onChange={setQuery}
        placeholder={t("searchSkills")}
      />

      <form.Field name="skillTagIds">
        {(field) => {
          const toggleSkill = (skillId: string) => {
            if (field.state.value.includes(skillId)) {
              field.handleChange(
                field.state.value.filter((id) => id !== skillId),
              )
              return
            }

            if (field.state.value.length < 10) {
              field.handleChange([...field.state.value, skillId])
            }
          }

          return (
            <div className="space-y-5">
              {isLoading && !hasCategories ? (
                <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("loadingSkills")}
                </div>
              ) : null}

              {hasCategories ? (
                <>
                  <SkillCategoryGrid
                    groups={groups}
                    categoryOrder={categoryOrder}
                    categoryLabels={categoryLabels}
                    selectedIds={field.state.value}
                    maxSkills={10}
                    isLoading={false}
                    onToggle={toggleSkill}
                    recommendedCategorySlugs={recommendedCategorySlugs}
                    recommendedLabel={t("recommended")}
                  />
                  <div ref={sentinelRef} className="py-2">
                    {isFetchingNextPage && (
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        {t("loadingMore")}
                      </div>
                    )}
                  </div>
                </>
              ) : !isLoading ? (
                <p className="py-4 text-sm text-muted-foreground">
                  {query.trim()
                    ? t("noSkillsFound")
                    : t("noSkillsAvailable")}
                </p>
              ) : null}

              <div className="flex items-center gap-3 pt-1">
                <div className="flex gap-1">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 w-1.5 rounded-full transition-colors duration-200 ${
                        index < field.state.value.length
                          ? "bg-primary"
                          : "bg-border"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {field.state.value.length}/10 {t("skillsSelected")}
                </p>
              </div>
            </div>
          )
        }}
      </form.Field>
    </FormSection>
  )
}
