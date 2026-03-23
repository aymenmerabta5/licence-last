"use client"

import { useForm } from "@tanstack/react-form"
import { useTranslations } from "next-intl"
import { useMemo, useRef, useState } from "react"
import {
  isTurnstileEnabledOnClient,
  type CaptchaHandle,
} from "@/components/TurnstileWidget"
import { authClient } from "@/lib/auth-client"
import {
  AUTH_ERROR_MESSAGE_KEYS,
  AUTH_ERROR_STATUS_KEYS,
  resolveLocalizedError,
} from "@/lib/error-message"
import { createResetPasswordSchema } from "@/lib/schemas/auth"

export type ResetPasswordFormApi = ReturnType<typeof useResetPassword>["form"]

export function useResetPassword() {
  const tr = useTranslations()
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
        if (isTurnstileEnabledOnClient() && !turnstileToken) {
          setServerError(tr("errors.auth.captchaRequired"))
          return
        }

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
      } catch (err) {
        setServerError(
          resolveLocalizedError(err, {
            t: tr,
            fallbackKey: "auth.resetPassword.setPasswordError",
            messageMap: AUTH_ERROR_MESSAGE_KEYS,
            statusMap: AUTH_ERROR_STATUS_KEYS,
          }),
        )
        setSuccess(false)
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
