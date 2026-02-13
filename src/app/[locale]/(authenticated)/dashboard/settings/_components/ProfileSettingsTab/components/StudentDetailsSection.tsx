"use client"

import { MapPin } from "lucide-react"

import { SelectField, TextAreaField, TextField } from "@/components/form-fields"
import { errorMessage } from "@/lib/schemas/auth"
import { WILAYA_OPTIONS_WITH_PLACEHOLDER } from "@/lib/wilayas"

import { SkillsManager } from "../../SkillsManager"

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

      <form.Field name="bio">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(field: any) => (
          <TextAreaField
            id="settings-bio"
            label="Professional Narrative (Bio)"
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            rows={5}
            className="min-h-[140px]"
          />
        )}
      </form.Field>

      <div className="h-px bg-border/20 w-full" />
      <SkillsManager />
    </>
  )
}
