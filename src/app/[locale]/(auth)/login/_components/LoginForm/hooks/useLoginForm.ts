"use client"

import { useState, useMemo } from "react"
import { useForm } from "@tanstack/react-form"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { useRouter } from "@/i18n/routing"
import { authClient } from "@/lib/auth-client"
import { createLoginSchema } from "@/lib/schemas/auth"
import { mapZodErrors } from "@/lib/schemas/map-errors"
import { getErrorMessage } from "@/lib/error-message"
import { getPostLoginRedirectPath } from "@/lib/post-login-redirect"
import { orpcClient } from "@/server/orpc/client"

export type LoginFormApi = ReturnType<typeof useLoginForm>["form"]

export function useLoginForm() {
  const t = useTranslations("auth.login")
  const tv = useTranslations("auth.validation")
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [serverError, setServerError] = useState("")
  const [needsVerification, setNeedsVerification] = useState(false)
  const [pendingEmail, setPendingEmail] = useState("")

  const loginSchema = useMemo(() => createLoginSchema(tv), [tv])

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: ({ value }) => mapZodErrors(loginSchema.safeParse(value)),
    },
    onSubmit: async ({ value }) => {
      setServerError("")
      setNeedsVerification(false)
      setPendingEmail(value.email)

      try {
        const result = await authClient.signIn.email({
          email: value.email,
          password: value.password,
          rememberMe,
        })

        if (result.error) {
          if (result.error.status === 403) {
            setNeedsVerification(true)
            setServerError(t("emailNotVerified"))
            return
          }
          setServerError(result.error.message || t("error"))
          return
        }

        const me = await orpcClient.users.getMe()
        const redirectPath = getPostLoginRedirectPath(me)
        router.push(redirectPath)
      } catch (err) {
        setServerError(getErrorMessage(err, t("error")))
      }
    },
  })

  async function resendVerificationEmail() {
    if (!pendingEmail) return
    setServerError("")

    try {
      const result = await authClient.sendVerificationEmail({
        email: pendingEmail,
        callbackURL: "/",
      })

      if (result.error) {
        toast.error(result.error.message || t("error"))
        return
      }

      toast.success(t("verificationSent"))
    } catch (err) {
      toast.error(getErrorMessage(err, t("error")))
    }
  }

  return {
    form,
    showPassword,
    setShowPassword,
    rememberMe,
    setRememberMe,
    serverError,
    needsVerification,
    resendVerificationEmail,
  }
}
