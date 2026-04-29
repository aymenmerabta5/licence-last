"use client"

import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import type { useChangePassword } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ChangePasswordDialog/hooks/useChangePassword"
import { PasswordField } from "@/components/form-fields/PasswordField"
import { ServerError } from "@/components/ServerError"
import { SuccessMessage } from "@/components/SuccessMessage"
import { Button } from "@/components/ui/button"
import { errorMessage } from "@/lib/schemas/auth"

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
  const t = useTranslations("dashboard.settings.changePassword")

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
        message={isSuccess ? t("success") : ""}
      />

      {!isSuccess && (
        <>
          <form.Field name="currentPassword">
            {(field) => (
              <PasswordField
                id="currentPassword"
                label={t("currentPassword")}
                placeholder={t("currentPasswordPlaceholder")}
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
                label={t("newPassword")}
                placeholder={t("newPasswordPlaceholder")}
                value={field.state.value}
                onChange={(v) => field.handleChange(v)}
                onBlur={field.handleBlur}
                error={
                  field.state.meta.errors.length
                    ? errorMessage(field.state.meta.errors[0])
                    : undefined
                }
                hint={t("passwordHint")}
              />
            )}
          </form.Field>

          <form.Field name="confirmNewPassword">
            {(field) => (
              <PasswordField
                id="confirmNewPassword"
                label={t("confirmPassword")}
                placeholder={t("confirmPasswordPlaceholder")}
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
                    {t("changing")}
                  </>
                ) : (
                  t("submit")
                )}
              </Button>
            )}
          </form.Subscribe>
        </>
      )}
    </form>
  )
}
