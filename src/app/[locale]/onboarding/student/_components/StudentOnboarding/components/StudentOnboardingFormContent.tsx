"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import {
  User,
  Phone,
  Github,
  Globe,
  MapPin,
  GraduationCap,
  Hash,
  FileText,
  ArrowRight,
  Loader2,
} from "lucide-react"

import { ServerError } from "@/components/ServerError"
import { FormHeader } from "@/components/FormHeader"
import { FormSection } from "@/components/form-fields"
import { TextField } from "@/components/form-fields"
import { TextAreaField } from "@/components/form-fields"
import { SelectField } from "@/components/form-fields"
import { SkillCategoryGrid } from "@/components/SkillCategoryGrid"
import { Button } from "@/components/ui/button"
import { errorMessage } from "@/lib/schemas/auth"
import { WILAYAS } from "@/lib/wilayas"
import { useSkillGrouping } from "@/hooks"

import { ease } from "@/lib/animations"
import { useOnboardingForm } from "@/app/[locale]/onboarding/student/_components/StudentOnboarding/hooks/useOnboardingForm"

export function StudentOnboardingFormContent() {
  const t = useTranslations("onboarding.student")
  const { form, serverError, departmentSkills, otherSkills, departments, selectedDepartmentId, handleDepartmentChange } = useOnboardingForm()
  const deptGroups = useSkillGrouping(departmentSkills)
  const otherGroups = useSkillGrouping(otherSkills)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-8"
    >
      <FormHeader title={t("title")} subtitle={t("subtitle")} />

      <ServerError message={serverError} />

      <FormSection title={`01 — ${t("personalSection")}`}>
        <form.Field name="bio">
          {(field) => (
            <TextAreaField
              id="student-bio"
              label={t("bio")}
              placeholder={t("bioPlaceholder")}
              icon={FileText}
              value={field.state.value}
              onChange={(v) => field.handleChange(v)}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>

        <form.Field name="phone">
          {(field) => (
            <TextField
              id="student-phone"
              type="tel"
              label={t("phone")}
              placeholder={t("phonePlaceholder")}
              icon={Phone}
              value={field.state.value}
              onChange={(v) => field.handleChange(v)}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>

        <form.Field name="studentNumber">
          {(field) => (
            <TextField
              id="student-number"
              label={t("studentNumber")}
              placeholder={t("studentNumberPlaceholder")}
              icon={Hash}
              value={field.state.value}
              onChange={(v) => field.handleChange(v)}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>

        <form.Field name="departmentId">
          {(field) => (
            <SelectField
              id="student-department"
              label={t("department")}
              placeholder={t("departmentPlaceholder")}
              icon={GraduationCap}
              options={departments.map((d) => ({
                value: d.id,
                label: d.name,
              }))}
              value={field.state.value}
              onChange={(v) => {
                field.handleChange(String(v))
                handleDepartmentChange(String(v))
              }}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>

        <form.Field name="level">
          {(field) => (
            <TextField
              id="student-level"
              label={t("level")}
              placeholder={t("levelPlaceholder")}
              icon={User}
              value={field.state.value}
              onChange={(v) => field.handleChange(v)}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>
      </FormSection>

      <FormSection title={`02 — ${t("locationSection")}`} delay={0.05}>
        <form.Field name="wilayaCode">
          {(field) => (
            <SelectField
              id="student-wilaya"
              label={t("wilaya")}
              placeholder={t("wilayaPlaceholder")}
              icon={MapPin}
              options={WILAYAS.map((name, i) => ({
                value: i + 1,
                label: `${String(i + 1).padStart(2, "0")} — ${name}`,
              }))}
              value={field.state.value}
              onChange={(v) => field.handleChange(Number(v))}
              onBlur={field.handleBlur}
              error={
                field.state.meta.errors.length > 0
                  ? errorMessage(field.state.meta.errors[0])
                  : undefined
              }
            />
          )}
        </form.Field>

        <form.Field name="address">
          {(field) => (
            <TextField
              id="student-address"
              label={t("address")}
              placeholder={t("addressPlaceholder")}
              icon={MapPin}
              value={field.state.value}
              onChange={(v) => field.handleChange(v)}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>
      </FormSection>

      <FormSection title={`03 — ${t("linksSection")}`} delay={0.1}>
        <form.Field name="githubUrl">
          {(field) => (
            <TextField
              id="student-github"
              type="url"
              label={t("githubUrl")}
              placeholder={t("githubUrlPlaceholder")}
              icon={Github}
              value={field.state.value}
              onChange={(v) => field.handleChange(v)}
              onBlur={field.handleBlur}
              error={
                field.state.meta.errors.length > 0
                  ? errorMessage(field.state.meta.errors[0])
                  : undefined
              }
            />
          )}
        </form.Field>

        <form.Field name="portfolioUrl">
          {(field) => (
            <TextField
              id="student-portfolio"
              type="url"
              label={t("portfolioUrl")}
              placeholder={t("portfolioUrlPlaceholder")}
              icon={Globe}
              value={field.state.value}
              onChange={(v) => field.handleChange(v)}
              onBlur={field.handleBlur}
              error={
                field.state.meta.errors.length > 0
                  ? errorMessage(field.state.meta.errors[0])
                  : undefined
              }
            />
          )}
        </form.Field>
      </FormSection>

      <FormSection title={`04 — ${t("skillsSection")}`} delay={0.15}>
        <p className="text-xs text-muted-foreground">
          {selectedDepartmentId ? t("skillsHint") : t("skillsSelectDepartmentFirst")}
        </p>

        <form.Field name="skillTagIds">
          {(field) => {
            const toggleSkill = (skillId: string) => {
              if (field.state.value.includes(skillId)) {
                field.handleChange(field.state.value.filter((id: string) => id !== skillId))
              } else if (field.state.value.length < 10) {
                field.handleChange([...field.state.value, skillId])
              }
            }

            return (
              <div className="space-y-5">
                {/* Tier 1: Recommended department skills */}
                {selectedDepartmentId && departmentSkills.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[11px] font-semibold text-primary">
                      {t("recommendedSkills")}
                    </p>
                    <SkillCategoryGrid
                      groups={deptGroups.groups}
                      categoryOrder={deptGroups.categoryOrder}
                      categoryLabels={deptGroups.categoryLabels}
                      selectedIds={field.state.value}
                      maxSkills={10}
                      isLoading={false}
                      onToggle={toggleSkill}
                    />
                  </div>
                )}

                {/* Separator between tiers */}
                {selectedDepartmentId && departmentSkills.length > 0 && otherSkills.length > 0 && (
                  <div className="border-t border-border/50" />
                )}

                {/* Tier 2: Other skills (or all skills when no department) */}
                {otherSkills.length > 0 && (
                  <div className="space-y-3">
                    {selectedDepartmentId && departmentSkills.length > 0 && (
                      <p className="text-[11px] font-semibold text-muted-foreground">
                        {t("otherSkills")}
                      </p>
                    )}
                    <SkillCategoryGrid
                      groups={otherGroups.groups}
                      categoryOrder={otherGroups.categoryOrder}
                      categoryLabels={otherGroups.categoryLabels}
                      selectedIds={field.state.value}
                      maxSkills={10}
                      isLoading={false}
                      onToggle={toggleSkill}
                    />
                  </div>
                )}

                {/* Skills counter with visual indicator */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex gap-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                          i < field.state.value.length
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.2 }}
        className="pt-2"
      >
        <form.Subscribe selector={(state) => [state.isSubmitting] as const}>
          {([isSubmitting]) => (
            <Button
              type="submit"
              variant="editorial"
              size="editorial"
              className="w-full h-12"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {t("submit")}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </motion.div>
    </form>
  )
}
