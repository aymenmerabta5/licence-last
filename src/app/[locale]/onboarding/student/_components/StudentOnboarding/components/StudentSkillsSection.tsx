import { useTranslations } from "next-intl"

import { SkillCategoryGrid } from "@/components/SkillCategoryGrid"
import { FormSection } from "@/components/form-fields"
import type {
  OnboardingFormApi,
  SkillGroupingResult,
  StudentSkillTag,
} from "@/app/[locale]/onboarding/student/_components/StudentOnboarding/components/types"

interface StudentSkillsSectionProps {
  form: OnboardingFormApi
  skillsSectionIndex: string
  selectedDepartmentId: string
  departmentSkills: StudentSkillTag[]
  otherSkills: StudentSkillTag[]
  departmentGrouping: SkillGroupingResult
  otherGrouping: SkillGroupingResult
}

export function StudentSkillsSection({
  form,
  skillsSectionIndex,
  selectedDepartmentId,
  departmentSkills,
  otherSkills,
  departmentGrouping,
  otherGrouping,
}: StudentSkillsSectionProps) {
  const t = useTranslations("onboarding.student")

  return (
    <FormSection title={`${skillsSectionIndex} - ${t("skillsSection")}`} delay={0.18}>
      <p className="text-xs text-muted-foreground">
        {selectedDepartmentId ? t("skillsHint") : t("skillsSelectDepartmentFirst")}
      </p>

      <form.Field name="skillTagIds">
        {(field) => {
          const toggleSkill = (skillId: string) => {
            if (field.state.value.includes(skillId)) {
              field.handleChange(field.state.value.filter((id) => id !== skillId))
              return
            }

            if (field.state.value.length < 10) {
              field.handleChange([...field.state.value, skillId])
            }
          }

          return (
            <div className="space-y-5">
              {selectedDepartmentId && departmentSkills.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-[11px] font-semibold text-primary">{t("recommendedSkills")}</p>
                  <SkillCategoryGrid
                    groups={departmentGrouping.groups}
                    categoryOrder={departmentGrouping.categoryOrder}
                    categoryLabels={departmentGrouping.categoryLabels}
                    selectedIds={field.state.value}
                    maxSkills={10}
                    isLoading={false}
                    onToggle={toggleSkill}
                  />
                </div>
              ) : null}

              {selectedDepartmentId && departmentSkills.length > 0 && otherSkills.length > 0 ? (
                <div className="border-t border-border/50" />
              ) : null}

              {otherSkills.length > 0 ? (
                <div className="space-y-3">
                  {selectedDepartmentId && departmentSkills.length > 0 ? (
                    <p className="text-[11px] font-semibold text-muted-foreground">
                      {t("otherSkills")}
                    </p>
                  ) : null}
                  <SkillCategoryGrid
                    groups={otherGrouping.groups}
                    categoryOrder={otherGrouping.categoryOrder}
                    categoryLabels={otherGrouping.categoryLabels}
                    selectedIds={field.state.value}
                    maxSkills={10}
                    isLoading={false}
                    onToggle={toggleSkill}
                  />
                </div>
              ) : null}

              <div className="flex items-center gap-3 pt-1">
                <div className="flex gap-1">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 w-1.5 rounded-full transition-colors duration-200 ${
                        index < field.state.value.length ? "bg-primary" : "bg-border"
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
