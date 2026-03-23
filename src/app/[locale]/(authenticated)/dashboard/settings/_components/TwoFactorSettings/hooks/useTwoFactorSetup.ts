"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { authClient } from "@/lib/auth-client"
import {
  AUTH_ERROR_MESSAGE_KEYS,
  AUTH_ERROR_STATUS_KEYS,
  resolveLocalizedError,
} from "@/lib/error-message"

export type TwoFactorSetupPhase =
  | "idle"
  | "enabling"
  | "verifying"
  | "showBackupCodes"
  | "disabling"

export function useTwoFactorSetup(isTwoFactorEnabled: boolean) {
  const tr = useTranslations()
  const t = useTranslations("dashboard.settings.twoFactor")

  const [phase, setPhase] = useState<TwoFactorSetupPhase>("idle")
  const [password, setPassword] = useState("")
  const [totpURI, setTotpURI] = useState("")
  const [secret, setSecret] = useState("")
  const [verifyCode, setVerifyCode] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function startEnable() {
    setPhase("enabling")
    setPassword("")
    setError("")
  }

  async function submitPassword() {
    if (!password.trim()) {
      setError(t("error.passwordRequired"))
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await authClient.twoFactor.enable({
        password,
      })

      if (result.error) {
        setError(
          resolveLocalizedError(result.error, {
            t: tr,
            fallbackKey: "dashboard.settings.twoFactor.error.enableFailed",
            messageMap: AUTH_ERROR_MESSAGE_KEYS,
            statusMap: AUTH_ERROR_STATUS_KEYS,
          }),
        )
        setIsLoading(false)
        return
      }

      setTotpURI(result.data?.totpURI ?? "")
      // Extract secret from URI for manual entry
      const match = result.data?.totpURI?.match(/secret=([A-Z2-7]+)/i)
      setSecret(match?.[1] ?? "")
      setPhase("verifying")
      setVerifyCode("")
    } catch (err) {
      setError(
        resolveLocalizedError(err, {
          t: tr,
          fallbackKey: "dashboard.settings.twoFactor.error.enableFailed",
          messageMap: AUTH_ERROR_MESSAGE_KEYS,
          statusMap: AUTH_ERROR_STATUS_KEYS,
        }),
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function verifyAndEnable() {
    if (!verifyCode.trim()) return
    setIsLoading(true)
    setError("")

    try {
      const result = await authClient.twoFactor.verifyTotp({
        code: verifyCode,
      })

      if (result.error) {
        setError(t("error.verifyFailed"))
        setIsLoading(false)
        return
      }

      // Generate backup codes
      const backupResult = await authClient.twoFactor.generateBackupCodes({
        password,
      })

      if (backupResult.data?.backupCodes) {
        setBackupCodes(backupResult.data.backupCodes)
      }

      setPhase("showBackupCodes")
      toast.success(t("success.enabled"))
    } catch (err) {
      setError(
        resolveLocalizedError(err, {
          t: tr,
          fallbackKey: "dashboard.settings.twoFactor.error.verifyFailed",
          messageMap: AUTH_ERROR_MESSAGE_KEYS,
          statusMap: AUTH_ERROR_STATUS_KEYS,
        }),
      )
    } finally {
      setIsLoading(false)
    }
  }

  function finishSetup() {
    setPhase("idle")
    setBackupCodes([])
    setPassword("")
    setVerifyCode("")
    setTotpURI("")
    setSecret("")
    // Force page reload to update twoFactorEnabled state
    window.location.reload()
  }

  async function startDisable() {
    setPhase("disabling")
    setPassword("")
    setError("")
  }

  async function confirmDisable() {
    if (!password.trim()) {
      setError(t("error.passwordRequired"))
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await authClient.twoFactor.disable({
        password,
      })

      if (result.error) {
        setError(
          resolveLocalizedError(result.error, {
            t: tr,
            fallbackKey: "dashboard.settings.twoFactor.error.disableFailed",
            messageMap: AUTH_ERROR_MESSAGE_KEYS,
            statusMap: AUTH_ERROR_STATUS_KEYS,
          }),
        )
        setIsLoading(false)
        return
      }

      toast.success(t("success.disabled"))
      setPhase("idle")
      window.location.reload()
    } catch (err) {
      setError(
        resolveLocalizedError(err, {
          t: tr,
          fallbackKey: "dashboard.settings.twoFactor.error.disableFailed",
          messageMap: AUTH_ERROR_MESSAGE_KEYS,
          statusMap: AUTH_ERROR_STATUS_KEYS,
        }),
      )
    } finally {
      setIsLoading(false)
    }
  }

  function cancel() {
    setPhase("idle")
    setPassword("")
    setVerifyCode("")
    setError("")
    setTotpURI("")
    setSecret("")
  }

  return {
    phase,
    password,
    setPassword,
    totpURI,
    secret,
    verifyCode,
    setVerifyCode,
    backupCodes,
    isLoading,
    error,
    isTwoFactorEnabled,
    startEnable,
    submitPassword,
    verifyAndEnable,
    finishSetup,
    startDisable,
    confirmDisable,
    cancel,
  }
}
