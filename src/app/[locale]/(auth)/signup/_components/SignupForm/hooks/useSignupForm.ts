import { useState, useMemo } from "react"
import { useForm } from "@tanstack/react-form"
import { useTranslations } from "next-intl"

import { authClient } from "@/lib/auth-client"
import { createSignupSchema } from "@/lib/schemas/auth"
import { mapZodErrors } from "@/lib/schemas/map-errors"

import type { SignupFormValues, SignupRole } from "../types"

export function useSignupForm(role: SignupRole) {
  const t = useTranslations("auth.validation")
  const [serverError, setServerError] = useState("")
  const [success, setSuccess] = useState(false)

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
            body: { role },
          },
        })

        if (result.error) {
          setServerError(result.error.message || "Signup failed")
          return
        }

        setSuccess(true)
      } catch {
        setServerError("An error occurred. Please try again.")
      }
    },
  })

  return {
    form,
    serverError,
    setServerError,
    success,
  }
}
