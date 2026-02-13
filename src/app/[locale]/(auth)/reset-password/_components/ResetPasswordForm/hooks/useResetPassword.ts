"use client"

import { useState, useMemo } from "react"
import { useForm } from "@tanstack/react-form"
import { useTranslations } from "next-intl"

import { authClient } from "@/lib/auth-client"
import { createResetPasswordSchema } from "@/lib/schemas/auth"

export type ResetPasswordFormApi = ReturnType<typeof useResetPassword>["form"]

export function useResetPassword() {
  const tv = useTranslations("auth.validation")

  const [serverError, setServerError] = useState("")
  const [success, setSuccess] = useState(false)

  const resetSchema = useMemo(() => createResetPasswordSchema(tv), [tv])

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: resetSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError("")

      try {
        await authClient.requestPasswordReset({
          email: value.email,
          redirectTo: "/reset-password/verify",
        })

        /* Always show success regardless of whether the email exists (security best practice) */
        setSuccess(true)
      } catch {
        setSuccess(true)
      }
    },
  })

  return { form, serverError, success }
}
