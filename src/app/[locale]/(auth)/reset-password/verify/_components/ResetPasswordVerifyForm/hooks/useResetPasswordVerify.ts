"use client"

import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { useTranslations } from "next-intl"

import { authClient } from "@/lib/auth-client"
import { getErrorMessage } from "@/lib/error-message"
import { createChangePasswordSchema } from "@/lib/schemas/auth"
import { mapZodErrors } from "@/lib/schemas/map-errors"

export function useResetPasswordVerify() {
  const t = useTranslations("auth.resetPassword")
  const tv = useTranslations("auth.validation")
  const searchParams = useSearchParams()

  const token = searchParams.get("token") ?? ""
  const hasInvalidTokenError = searchParams.get("error") === "INVALID_TOKEN"

  const [serverError, setServerError] = useState(
    hasInvalidTokenError ? t("invalidOrExpired") : "",
  )
  const [isSuccess, setIsSuccess] = useState(false)

  const schema = useMemo(
    () => createChangePasswordSchema(tv).omit({ currentPassword: true }),
    [tv],
  )

  const form = useForm({
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = schema.safeParse(value)
        const fieldErrors = mapZodErrors(result)
        if (fieldErrors) return fieldErrors

        if (value.newPassword !== value.confirmNewPassword) {
          return { fields: { confirmNewPassword: tv("passwordMismatch") } }
        }

        return undefined
      },
    },
    onSubmit: async ({ value }) => {
      setServerError("")
      setIsSuccess(false)

      if (!token) {
        setServerError(t("invalidOrExpired"))
        return
      }

      try {
        const result = await authClient.resetPassword({
          token,
          newPassword: value.newPassword,
        })

        if (result.error) {
          setServerError(result.error.message ?? t("setPasswordError"))
          return
        }

        setIsSuccess(true)
        form.reset()
      } catch (err) {
        setServerError(getErrorMessage(err, t("setPasswordError")))
      }
    },
  })

  return {
    form,
    serverError,
    isSuccess,
    hasToken: Boolean(token),
  }
}
