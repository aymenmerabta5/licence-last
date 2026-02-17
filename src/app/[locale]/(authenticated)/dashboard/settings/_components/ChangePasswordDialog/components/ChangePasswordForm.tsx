"use client"

import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PasswordField } from "@/components/form-fields/PasswordField"
import { ServerError } from "@/components/ServerError"
import { SuccessMessage } from "@/components/SuccessMessage"
import { errorMessage } from "@/lib/schemas/auth"

import type { useChangePassword } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ChangePasswordDialog/hooks/useChangePassword"

interface ChangePasswordFormProps {
  form: ReturnType<typeof useChangePassword>["form"]
  serverError: string
  isSuccess: boolean
}

export function ChangePasswordForm({
  form,
  serverError,
  isSuccess,
}: ChangePasswordFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-5"
    >
      <ServerError message={serverError} />
      <SuccessMessage
        message={isSuccess ? "Password changed successfully." : ""}
      />

      {!isSuccess && (
        <>
          <form.Field name="currentPassword">
            {(field) => (
              <PasswordField
                id="currentPassword"
                label="Current Password"
                placeholder="Enter your current password"
                value={field.state.value}
                onChange={(v) => field.handleChange(v)}
                onBlur={field.handleBlur}
                error={
                  field.state.meta.errors.length
                    ? errorMessage(field.state.meta.errors[0])
                    : undefined
                }
                autoComplete="current-password"
              />
            )}
          </form.Field>

          <form.Field name="newPassword">
            {(field) => (
              <PasswordField
                id="newPassword"
                label="New Password"
                placeholder="At least 8 characters"
                value={field.state.value}
                onChange={(v) => field.handleChange(v)}
                onBlur={field.handleBlur}
                error={
                  field.state.meta.errors.length
                    ? errorMessage(field.state.meta.errors[0])
                    : undefined
                }
                hint="Minimum 8 characters"
              />
            )}
          </form.Field>

          <form.Field name="confirmNewPassword">
            {(field) => (
              <PasswordField
                id="confirmNewPassword"
                label="Confirm New Password"
                placeholder="Re-enter new password"
                value={field.state.value}
                onChange={(v) => field.handleChange(v)}
                onBlur={field.handleBlur}
                error={
                  field.state.meta.errors.length
                    ? errorMessage(field.state.meta.errors[0])
                    : undefined
                }
              />
            )}
          </form.Field>

          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="editorial"
                className="w-full rounded-xl h-11"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin me-2" />
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            )}
          </form.Subscribe>
        </>
      )}
    </form>
  )
}
