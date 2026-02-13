"use client"

import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useTranslations } from "next-intl"

import { createChangePasswordSchema } from "@/lib/schemas/auth"
import { mapZodErrors } from "@/lib/schemas/map-errors"
import { getErrorMessage } from "@/lib/error-message"
import { authClient } from "@/lib/auth-client"

export function useChangePassword(onSuccess?: () => void) {
  const tv = useTranslations("auth.validation")

  const [serverError, setServerError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const schema = createChangePasswordSchema(tv)

  const form = useForm({
    defaultValues: {
      currentPassword: "",
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

      try {
        const result = await authClient.changePassword({
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
          revokeOtherSessions: true,
        })

        if (result.error) {
          setServerError(result.error.message ?? "Could not change password.")
          return
        }

        setIsSuccess(true)
        onSuccess?.()
      } catch (err) {
        setServerError(getErrorMessage(err, "Could not change password."))
      }
    },
  })

  function reset() {
    setServerError("")
    setIsSuccess(false)
    form.reset()
  }

  return { form, serverError, isSuccess, reset }
}
