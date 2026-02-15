"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth-client"
import { getErrorMessage } from "@/lib/error-message"

export function useDeleteAccount() {
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
        setError(getErrorMessage(result.error, t("error.deleteFailed")))
        setIsLoading(false)
        return
      }

      // Account deleted — redirect to goodbye page
      router.push("/goodbye")
    } catch (err) {
      setError(getErrorMessage(err, t("error.deleteFailed")))
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
