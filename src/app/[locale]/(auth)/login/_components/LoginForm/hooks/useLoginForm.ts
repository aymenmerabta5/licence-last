"use client"

import { useForm } from "@tanstack/react-form"
import { useTranslations } from "next-intl"
import { useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import {
  type TwoFactorMethod,
  verifyTwoFactorCode,
} from "@/app/[locale]/(auth)/login/_components/LoginForm/hooks/twoFactorUtils"
import {
  type CaptchaHandle,
  isTurnstileEnabledOnClient,
} from "@/components/TurnstileWidget"
import { useRouter } from "@/i18n/routing"
import { authClient } from "@/lib/auth-client"
import {
  AUTH_ERROR_MESSAGE_KEYS,
  AUTH_ERROR_STATUS_KEYS,
  resolveLocalizedError,
} from "@/lib/error-message"
import { getPostLoginRedirectPath } from "@/lib/post-login-redirect"
import { createLoginSchema } from "@/lib/schemas/auth"
import { mapZodErrors } from "@/lib/schemas/map-errors"
import { orpcClient } from "@/server/orpc/client"

export type LoginFormApi = ReturnType<typeof useLoginForm>["form"]

export function useLoginForm() {
  const tr = useTranslations()
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
  const [twoFactorMethod, setTwoFactorMethod] =
    useState<TwoFactorMethod>("totp")
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
        if (isTurnstileEnabledOnClient() && !turnstileToken) {
          setServerError(tr("errors.auth.captchaRequired"))
          return
        }

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
          setServerError(
            resolveLocalizedError(result.error, {
              t: tr,
              fallbackKey: "auth.login.error",
              messageMap: AUTH_ERROR_MESSAGE_KEYS,
              statusMap: AUTH_ERROR_STATUS_KEYS,
            }),
          )
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
        setServerError(
          resolveLocalizedError(err, {
            t: tr,
            fallbackKey: "auth.login.error",
            messageMap: AUTH_ERROR_MESSAGE_KEYS,
            statusMap: AUTH_ERROR_STATUS_KEYS,
          }),
        )
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
        setServerError(
          resolveLocalizedError(result.error, {
            t: tr,
            fallbackKey: "auth.login.twoFactor.error",
            messageMap: AUTH_ERROR_MESSAGE_KEYS,
            statusMap: AUTH_ERROR_STATUS_KEYS,
            codeMap: {
              INVALID_CODE: "auth.login.twoFactor.invalidCode",
            },
          }),
        )
        return
      }

      const me = await orpcClient.users.getMe()
      const redirectPath = getPostLoginRedirectPath(me)
      router.push(redirectPath)
    } catch (err) {
      setServerError(
        resolveLocalizedError(err, {
          t: tr,
          fallbackKey: "auth.login.twoFactor.error",
          messageMap: AUTH_ERROR_MESSAGE_KEYS,
          statusMap: AUTH_ERROR_STATUS_KEYS,
        }),
      )
    } finally {
      setIsVerifying2FA(false)
    }
  }

  async function sendOtpCode() {
    try {
      const result = await authClient.twoFactor.sendOtp()
      if (result.error) {
        toast.error(
          resolveLocalizedError(result.error, {
            t: tr,
            fallbackKey: "auth.login.twoFactor.error",
            messageMap: AUTH_ERROR_MESSAGE_KEYS,
            statusMap: AUTH_ERROR_STATUS_KEYS,
          }),
        )
        return
      }
      toast.success(t2fa("otpSent"))
    } catch (err) {
      toast.error(
        resolveLocalizedError(err, {
          t: tr,
          fallbackKey: "auth.login.twoFactor.error",
          messageMap: AUTH_ERROR_MESSAGE_KEYS,
          statusMap: AUTH_ERROR_STATUS_KEYS,
        }),
      )
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
        toast.error(
          resolveLocalizedError(result.error, {
            t: tr,
            fallbackKey: "auth.login.error",
            messageMap: AUTH_ERROR_MESSAGE_KEYS,
            statusMap: AUTH_ERROR_STATUS_KEYS,
          }),
        )
        return
      }

      toast.success(t("verificationSent"))
    } catch (err) {
      toast.error(
        resolveLocalizedError(err, {
          t: tr,
          fallbackKey: "auth.login.error",
          messageMap: AUTH_ERROR_MESSAGE_KEYS,
          statusMap: AUTH_ERROR_STATUS_KEYS,
        }),
      )
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
