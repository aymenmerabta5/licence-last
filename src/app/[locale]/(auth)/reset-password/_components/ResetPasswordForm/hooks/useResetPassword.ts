"use client"

import { useState, useMemo, useRef } from "react"
import { useForm } from "@tanstack/react-form"
import { useTranslations } from "next-intl"

import { authClient } from "@/lib/auth-client"
import { createResetPasswordSchema } from "@/lib/schemas/auth"
import type { CaptchaHandle } from "@/components/TurnstileWidget"

export type ResetPasswordFormApi = ReturnType<typeof useResetPassword>["form"]

export function useResetPassword() {
  const tv = useTranslations("auth.validation")

  const [serverError, setServerError] = useState("")
  const [success, setSuccess] = useState(false)

  // Turnstile CAPTCHA
  const [turnstileToken, setTurnstileToken] = useState("")
  const turnstileRef = useRef<CaptchaHandle>(null)

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
          fetchOptions: {
            headers: turnstileToken
              ? { "x-captcha-response": turnstileToken }
              : {},
          },
        })

        /* Always show success regardless of whether the email exists (security best practice) */
        setSuccess(true)
      } catch {
        setSuccess(true)
      }
    },
  })

  return {
    form,
    serverError,
    success,
    // Turnstile
    turnstileToken,
    setTurnstileToken,
    turnstileRef,
  }
}
