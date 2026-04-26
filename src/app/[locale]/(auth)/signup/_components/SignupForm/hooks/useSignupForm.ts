import { useForm } from "@tanstack/react-form"
import { useTranslations } from "next-intl"
import { useMemo, useRef, useState } from "react"
import type {
  SignupFormValues,
  SignupRole,
} from "@/app/[locale]/(auth)/signup/_components/SignupForm/types"
import {
  type CaptchaHandle,
  isTurnstileEnabledOnClient,
} from "@/components/TurnstileWidget"
import { authClient } from "@/lib/auth-client"
import {
  AUTH_ERROR_MESSAGE_KEYS,
  AUTH_ERROR_STATUS_KEYS,
  resolveLocalizedError,
} from "@/lib/error-message"
import { createSignupSchema } from "@/lib/schemas/auth"
import { mapZodErrors } from "@/lib/schemas/map-errors"

export type SignupFormApi = ReturnType<typeof useSignupForm>["form"]

export function useSignupForm(role: SignupRole) {
  const tr = useTranslations()
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

        return Object.keys(fieldErrors).length > 0
          ? { fields: fieldErrors }
          : undefined
      },
    },
    onSubmit: async ({ value }) => {
      setServerError("")
      setSuccess(false)

      try {
        if (isTurnstileEnabledOnClient() && !turnstileToken) {
          setServerError(tr("errors.auth.captchaRequired"))
          return
        }

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
          setServerError(
            resolveLocalizedError(result.error, {
              t: tr,
              fallbackKey: "auth.signup.error",
              messageMap: AUTH_ERROR_MESSAGE_KEYS,
              statusMap: AUTH_ERROR_STATUS_KEYS,
              codeMap: {
                USER_ALREADY_EXISTS: "errors.auth.emailAlreadyExists",
              },
            }),
          )
          return
        }

        setSuccess(true)
      } catch (err) {
        resetTurnstile()
        setServerError(
          resolveLocalizedError(err, {
            t: tr,
            fallbackKey: "auth.signup.error",
            messageMap: AUTH_ERROR_MESSAGE_KEYS,
            statusMap: AUTH_ERROR_STATUS_KEYS,
          }),
        )
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
