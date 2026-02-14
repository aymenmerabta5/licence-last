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
  Check,
} from "lucide-react"

import { ServerError } from "@/components/ServerError"
import { FormHeader } from "@/components/FormHeader"
import { FormSection } from "@/components/form-fields"
import { TextField } from "@/components/form-fields"
import { TextAreaField } from "@/components/form-fields"
import { SelectField } from "@/components/form-fields"
import { Button } from "@/components/ui/button"
import { errorMessage } from "@/lib/schemas/auth"
import { WILAYAS } from "@/lib/wilayas"
import { useSkillGrouping } from "@/hooks"

import { ease } from "@/lib/animations"
import { useOnboardingForm } from "./hooks/useOnboardingForm"

export function StudentOnboardingForm() {
  const t = useTranslations("onboarding.student")
  const { form, serverError, skillTags, departments, selectedDepartmentId, handleDepartmentChange } = useOnboardingForm()
  const { groups, categoryOrder, categoryLabels } = useSkillGrouping(skillTags)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-7"
    >
      <FormHeader title={t("title")} subtitle={t("subtitle")} />

      <ServerError message={serverError} />

      <FormSection title={t("personalSection")}>
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

      <FormSection title={t("locationSection")} delay={0.05}>
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

      <FormSection title={t("linksSection")} delay={0.1}>
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

      <FormSection title={t("skillsSection")} delay={0.15}>
        <p className="text-xs text-muted-foreground">
          {selectedDepartmentId ? t("skillsHint") : t("skillsSelectDepartmentFirst")}
        </p>

        <form.Field name="skillTagIds">
          {(field) => (
            <div className="space-y-4">
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
                        const isSelected = field.state.value.includes(skill.id)
                        const isAtMax = field.state.value.length >= 10

                        return (
                          <button
                            key={skill.id}
                            type="button"
                            disabled={!isSelected && isAtMax}
                            onClick={() => {
                              if (isSelected) {
                                field.handleChange(
                                  field.state.value.filter((id: string) => id !== skill.id)
                                )
                              } else {
                                field.handleChange([...field.state.value, skill.id])
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
                {field.state.value.length}/10 {t("skillsSelected")}
              </p>
            </div>
          )}
        </form.Field>
      </FormSection>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.2 }}
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
