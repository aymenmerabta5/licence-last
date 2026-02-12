"use client"

import { User, Mail } from "lucide-react"

import { TextField } from "@/components/form-fields"
import { PasswordField } from "@/components/form-fields"
import { CheckboxField } from "@/components/form-fields"
import { errorMessage } from "@/lib/schemas/auth"

import type { SignupFormApi } from "../hooks/useSignupForm"

interface SignupFieldsProps {
  form: SignupFormApi
  labels: {
    name: string
    namePlaceholder: string
    email: string
    emailPlaceholder: string
    password: string
    passwordPlaceholder: string
    passwordHint: string
    confirmPassword: string
    confirmPasswordPlaceholder: string
    agreeToTerms: React.ReactNode
  }
}

export function SignupFields({ form, labels }: SignupFieldsProps) {
  return (
    <div className="space-y-5">
      <form.Field name="name">
        {(field) => (
          <TextField
            id="signup-name"
            label={labels.name}
            placeholder={labels.namePlaceholder}
            icon={User}
            value={field.state.value}
            onChange={(value) => field.handleChange(value)}
            onBlur={field.handleBlur}
            error={
              field.state.meta.errors.length > 0
                ? errorMessage(field.state.meta.errors[0])
                : undefined
            }
            autoComplete="name"
          />
        )}
      </form.Field>

      <form.Field name="email">
        {(field) => (
          <TextField
            id="signup-email"
            type="email"
            label={labels.email}
            placeholder={labels.emailPlaceholder}
            icon={Mail}
            value={field.state.value}
            onChange={(value) => field.handleChange(value)}
            onBlur={field.handleBlur}
            error={
              field.state.meta.errors.length > 0
                ? errorMessage(field.state.meta.errors[0])
                : undefined
            }
            autoComplete="email"
          />
        )}
      </form.Field>

      <form.Field name="password">
        {(field) => (
          <PasswordField
            id="signup-password"
            label={labels.password}
            placeholder={labels.passwordPlaceholder}
            value={field.state.value}
            onChange={(value) => field.handleChange(value)}
            onBlur={field.handleBlur}
            error={
              field.state.meta.errors.length > 0
                ? errorMessage(field.state.meta.errors[0])
                : undefined
            }
            hint={labels.passwordHint}
            autoComplete="new-password"
          />
        )}
      </form.Field>

      <form.Field name="confirmPassword">
        {(field) => (
          <PasswordField
            id="signup-confirm-password"
            label={labels.confirmPassword}
            placeholder={labels.confirmPasswordPlaceholder}
            value={field.state.value}
            onChange={(value) => field.handleChange(value)}
            onBlur={field.handleBlur}
            error={
              field.state.meta.errors.length > 0
                ? errorMessage(field.state.meta.errors[0])
                : undefined
            }
            autoComplete="new-password"
          />
        )}
      </form.Field>

      <form.Field name="agreeToTerms">
        {(field) => (
          <CheckboxField
            id="signup-terms"
            label={labels.agreeToTerms}
            checked={field.state.value}
            onChange={(checked) => field.handleChange(checked)}
            onBlur={field.handleBlur}
            error={
              field.state.meta.errors.length > 0
                ? errorMessage(field.state.meta.errors[0])
                : undefined
            }
          />
        )}
      </form.Field>
    </div>
  )
}
