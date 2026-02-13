"use client"

import { User } from "lucide-react"

import { TextField } from "@/components/form-fields"
import { errorMessage } from "@/lib/schemas/auth"

interface PersonalInfoSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
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
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(field: any) => (
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
        icon={User}
        value={email}
        onChange={() => {}}
        disabled
      />
    </div>
  )
}
