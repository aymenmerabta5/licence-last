"use client"

import { Globe, GraduationCap, MapPin, PenLine } from "lucide-react"
import { SkillsManager } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SkillsManager"
import { SelectField, TextAreaField, TextField } from "@/components/form-fields"
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
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border/20" />
      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 shrink-0">
        <Icon className="h-3 w-3" />
        {label}
      </span>
      <div className="h-px flex-1 bg-border/20" />
    </div>
  )
}

interface StudentDetailsSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
  isBusy: boolean
}

export function StudentDetailsSection({
  form,
  isBusy,
}: StudentDetailsSectionProps) {
  return (
    <>
      {/* Academic Info */}
      <div className="space-y-5">
        <SectionDivider icon={GraduationCap} label="Academic" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form.Field name="department">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(field: any) => (
              <TextField
                id="settings-department"
                label="Department"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                disabled={isBusy}
              />
            )}
          </form.Field>

          <form.Field name="level">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(field: any) => (
              <TextField
                id="settings-level"
                label="Level"
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
        <SectionDivider icon={MapPin} label="Location" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form.Field name="wilayaCode">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(field: any) => (
              <SelectField
                id="settings-wilaya"
                label="Wilaya"
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
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(field: any) => (
              <TextField
                id="settings-address"
                label="Address"
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
        <SectionDivider icon={Globe} label="Web Presence" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form.Field name="githubUrl">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(field: any) => (
              <TextField
                id="settings-github-url"
                label="GitHub URL"
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
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(field: any) => (
              <TextField
                id="settings-portfolio-url"
                label="Portfolio / LinkedIn URL"
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
        <SectionDivider icon={PenLine} label="Bio" />
        <form.Field name="bio">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => (
            <TextAreaField
              id="settings-bio"
              label="Professional Narrative"
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
    </>
  )
}
