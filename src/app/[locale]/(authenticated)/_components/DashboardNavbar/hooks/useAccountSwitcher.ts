"use client"

import { useTranslations } from "next-intl"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import type { DeviceSession } from "@/app/[locale]/(authenticated)/_components/DashboardNavbar/types"
import { useRouter } from "@/i18n/routing"
import { authClient } from "@/lib/auth-client"

export function useAccountSwitcher(currentUserId: string) {
  const router = useRouter()
  const t = useTranslations("dashboard.accountSwitcher")

  const [sessions, setSessions] = useState<DeviceSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [switchingToken, setSwitchingToken] = useState<string | null>(null)
  const [removingToken, setRemovingToken] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchSessions() {
      try {
        const res = await authClient.multiSession.listDeviceSessions()
        if (!cancelled && res.data) {
          setSessions(res.data as unknown as DeviceSession[])
        }
      } catch {
        // Silently fail — user just sees their single account
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchSessions()
    return () => {
      cancelled = true
    }
  }, [])

  const switchAccount = useCallback(
    async (token: string, name: string) => {
      setSwitchingToken(token)
      try {
        await authClient.multiSession.setActive({ sessionToken: token })
        toast.success(t("switchSuccess", { name }))
        // Full reload needed so server components re-read the new session cookie
        window.location.reload()
      } catch {
        toast.error(t("switchError"))
        setSwitchingToken(null)
      }
    },
    [t],
  )

  const removeAccount = useCallback(
    async (token: string) => {
      setRemovingToken(token)
      try {
        await authClient.multiSession.revoke({ sessionToken: token })
        setSessions((prev) => prev.filter((s) => s.session.token !== token))
        toast.success(t("removeSuccess"))
      } catch {
        toast.error(t("removeError"))
      } finally {
        setRemovingToken(null)
      }
    },
    [t],
  )

  const addAccount = useCallback(() => {
    router.push("/login")
  }, [router])

  return {
    sessions,
    isLoading,
    switchingToken,
    removingToken,
    currentUserId,
    switchAccount,
    removeAccount,
    addAccount,
  }
}
