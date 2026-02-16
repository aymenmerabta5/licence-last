import { useState, useMemo, useRef } from "react"
import { useForm } from "@tanstack/react-form"
import { useTranslations } from "next-intl"

import { authClient } from "@/lib/auth-client"
import { createSignupSchema } from "@/lib/schemas/auth"
import { mapZodErrors } from "@/lib/schemas/map-errors"
import type { CaptchaHandle } from "@/components/TurnstileWidget"

import type { SignupFormValues, SignupRole } from "../types"

export type SignupFormApi = ReturnType<typeof useSignupForm>["form"]

export function useSignupForm(role: SignupRole) {
  const t = useTranslations("auth.validation")
  const [serverError, setServerError] = useState("")
  const [success, setSuccess] = useState(false)

  // Turnstile CAPTCHA
  const [turnstileToken, setTurnstileToken] = useState("")
  const turnstileRef = useRef<CaptchaHandle>(null)
  const resetTurnstile = () => {
    setTurnstileToken("")
    turnstileRef.current?.reset()
  }

  const signupSchema = useMemo(() => createSignupSchema(t), [t])

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    } as SignupFormValues,
    validators: {
      onSubmit: ({ value }) => {
        const result = mapZodErrors(signupSchema.safeParse(value))
        if (result) return result

        const fieldErrors: Record<string, string> = {}

        if (value.password !== value.confirmPassword) {
          fieldErrors.confirmPassword = t("passwordMismatch")
        }

        if (!value.agreeToTerms) {
          fieldErrors.agreeToTerms = t("termsRequired")
        }

        return Object.keys(fieldErrors).length > 0 ? { fields: fieldErrors } : undefined
      },
    },
    onSubmit: async ({ value }) => {
      setServerError("")
      setSuccess(false)

      try {
        const result = await authClient.signUp.email({
          email: value.email,
          password: value.password,
          name: value.name,
          callbackURL: "/",
          fetchOptions: {
            body: { accountType: role },
            headers: turnstileToken
              ? { "x-captcha-response": turnstileToken }
              : {},
          },
        })

        if (result.error) {
          resetTurnstile()
          setServerError(result.error.message || "Signup failed")
          return
        }

        setSuccess(true)
      } catch {
        resetTurnstile()
        setServerError("An error occurred. Please try again.")
      }
    },
  })

  return {
    form,
    serverError,
    setServerError,
    success,
    // Turnstile
    turnstileToken,
    setTurnstileToken,
    turnstileRef,
  }
}
