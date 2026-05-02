"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "@/i18n/routing"

import { authClient } from "@/lib/auth-client"
import { resolveLocalizedError } from "@/lib/error-message"
import { orpc } from "@/server/orpc/client"

export function useImpersonation() {
  const t = useTranslations()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const impersonate = async (userId: string) => {
    setIsPending(true)
    try {
      const { error } = await authClient.admin.impersonateUser({ userId })
      if (error) {
        toast.error(
          resolveLocalizedError(error, {
            t,
            fallbackKey: "errors.common.impersonationFailed",
          }),
        )
        return
      }

      const meQueryOptions = orpc.users.getMe.queryOptions()
      queryClient.resetQueries({ queryKey: meQueryOptions.queryKey })

      toast.success(t("errors.common.impersonationStarted"))
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      toast.error(
        resolveLocalizedError(error, {
          t,
          fallbackKey: "errors.common.impersonationFailed",
        }),
      )
    } finally {
      setIsPending(false)
    }
  }

  return { impersonate, isPending }
}
