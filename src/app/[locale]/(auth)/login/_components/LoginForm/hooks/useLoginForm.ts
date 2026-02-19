"use client"

import { useState, useMemo, useRef } from "react"
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
import type { CaptchaHandle } from "@/components/TurnstileWidget"
import {
  type TwoFactorMethod,
  verifyTwoFactorCode,
} from "@/app/[locale]/(auth)/login/_components/LoginForm/hooks/twoFactorUtils"

export type LoginFormApi = ReturnType<typeof useLoginForm>["form"]

export function useLoginForm() {
  const t = useTranslations("auth.login")
  const t2fa = useTranslations("auth.login.twoFactor")
  const tv = useTranslations("auth.validation")
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [serverError, setServerError] = useState("")
  const [needsVerification, setNeedsVerification] = useState(false)
  const [pendingEmail, setPendingEmail] = useState("")

  const [turnstileToken, setTurnstileToken] = useState("")
  const turnstileRef = useRef<CaptchaHandle>(null)
  const resetTurnstile = () => {
    setTurnstileToken("")
    turnstileRef.current?.reset()
  }

  const [twoFactorRequired, setTwoFactorRequired] = useState(false)
  const [twoFactorMethod, setTwoFactorMethod] = useState<TwoFactorMethod>("totp")
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [trustDevice, setTrustDevice] = useState(false)
  const [isVerifying2FA, setIsVerifying2FA] = useState(false)

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
          fetchOptions: {
            headers: turnstileToken
              ? { "x-captcha-response": turnstileToken }
              : {},
          },
        })

        if (result.error) {
          resetTurnstile()
          if (result.error.status === 403) {
            setNeedsVerification(true)
            setServerError(t("emailNotVerified"))
            return
          }
          setServerError(result.error.message || t("error"))
          return
        }

        if (result.data && "twoFactorRedirect" in result.data) {
          setTwoFactorRequired(true)
          setServerError("")
          return
        }

        const me = await orpcClient.users.getMe()
        const redirectPath = getPostLoginRedirectPath(me)
        router.push(redirectPath)
      } catch (err) {
        resetTurnstile()
        setServerError(getErrorMessage(err, t("error")))
      }
    },
  })

  async function verify2FA() {
    if (!twoFactorCode.trim()) return
    setIsVerifying2FA(true)
    setServerError("")

    try {
      const result = await verifyTwoFactorCode({
        method: twoFactorMethod,
        code: twoFactorCode,
        trustDevice,
      })

      if (result.error) {
        setServerError(t2fa("invalidCode"))
        return
      }

      const me = await orpcClient.users.getMe()
      const redirectPath = getPostLoginRedirectPath(me)
      router.push(redirectPath)
    } catch (err) {
      setServerError(getErrorMessage(err, t2fa("error")))
    } finally {
      setIsVerifying2FA(false)
    }
  }

  async function sendOtpCode() {
    try {
      const result = await authClient.twoFactor.sendOtp()
      if (result.error) {
        toast.error(result.error.message || t2fa("error"))
        return
      }
      toast.success(t2fa("otpSent"))
    } catch (err) {
      toast.error(getErrorMessage(err, t2fa("error")))
    }
  }

  function backToLogin() {
    setTwoFactorRequired(false)
    setTwoFactorCode("")
    setServerError("")
  }

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
    turnstileToken,
    setTurnstileToken,
    turnstileRef,
    twoFactorRequired,
    twoFactorMethod,
    setTwoFactorMethod,
    twoFactorCode,
    setTwoFactorCode,
    trustDevice,
    setTrustDevice,
    isVerifying2FA,
    verify2FA,
    sendOtpCode,
    backToLogin,
  }
}
