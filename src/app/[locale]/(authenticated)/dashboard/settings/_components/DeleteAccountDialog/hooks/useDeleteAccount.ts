"use client"

import { useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { authClient } from "@/lib/auth-client"
import {
  AUTH_ERROR_MESSAGE_KEYS,
  AUTH_ERROR_STATUS_KEYS,
  resolveLocalizedError,
} from "@/lib/error-message"

export function useDeleteAccount() {
  const tr = useTranslations()
  const t = useTranslations("dashboard.settings.deleteAccount")
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirmText, setConfirmText] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const isConfirmed = confirmText === t("confirmPhrase")

  async function handleDelete() {
    if (!password.trim()) {
      setError(t("error.passwordRequired"))
      return
    }
    if (!isConfirmed) {
      setError(t("error.confirmRequired"))
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await authClient.deleteUser({
        password,
        callbackURL: "/goodbye",
      })

      if (result.error) {
        setError(
          resolveLocalizedError(result.error, {
            t: tr,
            fallbackKey: "dashboard.settings.deleteAccount.error.deleteFailed",
            messageMap: AUTH_ERROR_MESSAGE_KEYS,
            statusMap: AUTH_ERROR_STATUS_KEYS,
          }),
        )
        setIsLoading(false)
        return
      }

      // Account deleted — redirect to goodbye page
      router.push("/goodbye")
    } catch (err) {
      setError(
        resolveLocalizedError(err, {
          t: tr,
          fallbackKey: "dashboard.settings.deleteAccount.error.deleteFailed",
          messageMap: AUTH_ERROR_MESSAGE_KEYS,
          statusMap: AUTH_ERROR_STATUS_KEYS,
        }),
      )
      setIsLoading(false)
    }
  }

  function reset() {
    setPassword("")
    setConfirmText("")
    setError("")
    setIsLoading(false)
  }

  return {
    password,
    setPassword,
    confirmText,
    setConfirmText,
    error,
    isLoading,
    isConfirmed,
    handleDelete,
    reset,
  }
}
