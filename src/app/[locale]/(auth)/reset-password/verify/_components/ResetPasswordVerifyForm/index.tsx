"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { ArrowLeft, Loader2 } from "lucide-react"

import { PasswordField } from "@/components/form-fields/PasswordField"
import { ServerError } from "@/components/ServerError"
import { SuccessMessage } from "@/components/SuccessMessage"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"
import { errorMessage } from "@/lib/schemas/auth"

import { useResetPasswordVerify } from "./hooks/useResetPasswordVerify"

export function ResetPasswordVerifyForm() {
  const t = useTranslations("auth.resetPassword")
  const { form, serverError, isSuccess, hasToken } = useResetPasswordVerify()

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-8"
    >
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <h1 className="mb-2 font-serif text-3xl tracking-tight text-heading">
          {t("verifyTitle")}
        </h1>
        <p className="text-sm font-light text-muted-foreground">
          {t("verifySubtitle")}
        </p>
      </motion.div>

      <ServerError message={serverError} />
      <SuccessMessage message={isSuccess ? t("setPasswordSuccess") : ""} />

      {!isSuccess && (
        <>
          <motion.div
            {...reveal}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
            className="space-y-5"
          >
            <form.Field name="newPassword">
              {(field) => (
                <PasswordField
                  id="new-password"
                  label={t("newPassword")}
                  placeholder={t("newPasswordPlaceholder")}
                  value={field.state.value}
                  onChange={field.handleChange}
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

            <form.Field name="confirmNewPassword">
              {(field) => (
                <PasswordField
                  id="confirm-new-password"
                  label={t("confirmNewPassword")}
                  placeholder={t("confirmNewPasswordPlaceholder")}
                  value={field.state.value}
                  onChange={field.handleChange}
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
          </motion.div>

          <motion.div
            {...reveal}
            transition={{ duration: 0.6, ease, delay: 0.15 }}
          >
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  type="submit"
                  variant="editorial"
                  size="editorial"
                  className="h-12 w-full"
                  disabled={isSubmitting || !hasToken}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("setPassword")
                  )}
                </Button>
              )}
            </form.Subscribe>
          </motion.div>
        </>
      )}

      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.2 }}
      >
        <Link
          href="/login"
          className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-heading transition-colors duration-300 hover:text-primary [[dir=rtl]_&]:tracking-normal"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {t("backToLogin")}
        </Link>
      </motion.div>
    </form>
  )
}
