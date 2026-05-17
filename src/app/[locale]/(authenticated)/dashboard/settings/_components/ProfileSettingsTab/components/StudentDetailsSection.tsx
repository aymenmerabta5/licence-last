"use client"

import { Globe, GraduationCap, MapPin, PenLine } from "lucide-react"
import { useTranslations } from "next-intl"
import { LanguagesManager } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/LanguagesManager"
import type { ProfileSettingsFormApi } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/hooks/useProfileSettings"
import { SkillsManager } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SkillsManager"
import { SelectField, TextAreaField, TextField } from "@/components/form-fields"
import { isLanguageRequirementsEnabledOnClient } from "@/lib/feature-flags-client"
import { errorMessage } from "@/lib/schemas/auth"
import { WILAYA_OPTIONS_WITH_PLACEHOLDER } from "@/lib/wilayas"

function SectionDivider({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <div className="flex items-center gap-6 py-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/40" />
      <span className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.3em] text-primary/60 shrink-0 bg-background/50 backdrop-blur-sm px-4 py-1 rounded-full border border-border/20">
        <Icon className="h-3.5 w-3.5" />
        {label}
        <span className="h-1 w-1 rounded-full bg-primary/40 inline-block" />
      </span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/40" />
    </div>
  )
}

interface StudentDetailsSectionProps {
  form: ProfileSettingsFormApi
  isBusy: boolean
}

export function StudentDetailsSection({
  form,
  isBusy,
}: StudentDetailsSectionProps) {
  const t = useTranslations("dashboard.settings")
  const isLanguageRequirementsEnabled = isLanguageRequirementsEnabledOnClient()

  return (
    <>
      {/* Academic Info */}
      <div className="space-y-5">
        <SectionDivider icon={GraduationCap} label={t("academic")} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form.Field name="department">
            {(field) => (
              <TextField
                id="settings-department"
                label={t("department")}
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                disabled={isBusy}
              />
            )}
          </form.Field>

          <form.Field name="level">
            {(field) => (
              <TextField
                id="settings-level"
                label={t("level")}
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                disabled={isBusy}
              />
            )}
          </form.Field>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-5">
        <SectionDivider icon={MapPin} label={t("location")} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form.Field name="wilayaCode">
            {(field) => (
              <SelectField
                id="settings-wilaya"
                label={t("wilaya")}
                icon={MapPin}
                value={field.state.value}
                onChange={(next) => field.handleChange(Number(next))}
                onBlur={field.handleBlur}
                disabled={isBusy}
                options={WILAYA_OPTIONS_WITH_PLACEHOLDER}
              />
            )}
          </form.Field>

          <form.Field name="address">
            {(field) => (
              <TextField
                id="settings-address"
                label={t("address")}
                icon={MapPin}
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                disabled={isBusy}
              />
            )}
          </form.Field>
        </div>
      </div>

      {/* Web Presence */}
      <div className="space-y-5">
        <SectionDivider icon={Globe} label={t("webPresence")} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form.Field name="githubUrl">
            {(field) => (
              <TextField
                id="settings-github-url"
                label={t("githubUrl")}
                type="url"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                error={
                  field.state.meta.errors.length > 0
                    ? errorMessage(field.state.meta.errors[0])
                    : undefined
                }
                disabled={isBusy}
              />
            )}
          </form.Field>

          <form.Field name="portfolioUrl">
            {(field) => (
              <TextField
                id="settings-portfolio-url"
                label={t("portfolioUrl")}
                type="url"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                error={
                  field.state.meta.errors.length > 0
                    ? errorMessage(field.state.meta.errors[0])
                    : undefined
                }
                disabled={isBusy}
              />
            )}
          </form.Field>
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-5">
        <SectionDivider icon={PenLine} label={t("bio")} />
        <form.Field name="bio">
          {(field) => (
            <TextAreaField
              id="settings-bio"
              label={t("professionalNarrative")}
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              rows={5}
              className="min-h-[140px]"
            />
          )}
        </form.Field>
      </div>

      {/* Skills */}
      <div className="h-px bg-border/20 w-full" />
      <SkillsManager />

      {isLanguageRequirementsEnabled ? (
        <>
          <div className="h-px bg-border/20 w-full" />
          <LanguagesManager />
        </>
      ) : null}
    </>
  )
}
