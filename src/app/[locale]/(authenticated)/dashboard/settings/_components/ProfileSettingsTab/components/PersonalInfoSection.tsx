"use client"

import { Mail, User } from "lucide-react"
import type { ProfileSettingsFormApi } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/hooks/useProfileSettings"
import { TextField } from "@/components/form-fields"
import { errorMessage } from "@/lib/schemas/auth"

interface PersonalInfoSectionProps {
  form: ProfileSettingsFormApi
  email: string
  isBusy: boolean
}

export function PersonalInfoSection({
  form,
  email,
  isBusy,
}: PersonalInfoSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <form.Field name="name">
        {(field) => (
          <TextField
            id="settings-full-name"
            label="Full Name"
            icon={User}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            error={
              field.state.meta.errors.length > 0
                ? errorMessage(field.state.meta.errors[0])
                : undefined
            }
            disabled={isBusy}
            autoComplete="name"
          />
        )}
      </form.Field>

      <TextField
        id="settings-email"
        label="Email"
        icon={Mail}
        value={email}
        onChange={() => {}}
        disabled
      />
    </div>
  )
}
