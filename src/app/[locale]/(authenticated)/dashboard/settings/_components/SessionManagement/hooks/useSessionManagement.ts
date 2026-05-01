"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { toast } from "sonner"
import type { EnrichedSession } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SessionManagement/types"
import { resolveLocalizedError } from "@/lib/error-message"
import { parseUserAgent } from "@/lib/user-agent"
import { orpc } from "@/server/orpc/client"

export function useSessionManagement() {
  const tr = useTranslations()
  const t = useTranslations("dashboard.settings.sessions")
  const queryClient = useQueryClient()

  const sessionsQuery = useQuery(orpc.users.listMySessions.queryOptions())

  const enrichedSessions = useMemo((): EnrichedSession[] => {
    if (!sessionsQuery.data) return []
    return sessionsQuery.data.map((s) => ({
      ...s,
      parsed: parseUserAgent(s.userAgent),
    })) as EnrichedSession[]
  }, [sessionsQuery.data])

  const currentSession = enrichedSessions.find((s) => s.isCurrent)
  const otherSessions = enrichedSessions.filter((s) => !s.isCurrent)

  const sessionsQueryKey = orpc.users.listMySessions.queryOptions().queryKey

  const revokeMutation = useMutation({
    ...orpc.users.revokeMySession.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: sessionsQueryKey })
      const previousData = queryClient.getQueryData(sessionsQueryKey)
      queryClient.setQueryData(sessionsQueryKey, (old) => {
        if (!old) return old
        return old.filter((s) => s.id !== variables.sessionId)
      })
      return { previousData }
    },
    onError: (err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(sessionsQueryKey, context.previousData)
      }
      toast.error(
        resolveLocalizedError(err, {
          t: tr,
          fallbackKey: "dashboard.settings.sessions.revokeError",
        }),
      )
    },
    onSuccess: () => {
      toast.success(t("revokeSuccess"))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: sessionsQueryKey })
    },
  })

  const revokeOthersMutation = useMutation({
    ...orpc.users.revokeOtherSessions.mutationOptions(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: sessionsQueryKey })
      const previousData = queryClient.getQueryData(sessionsQueryKey)
      queryClient.setQueryData(sessionsQueryKey, (old) => {
        if (!old) return old
        return old.filter((s) => s.isCurrent)
      })
      return { previousData }
    },
    onError: (err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(sessionsQueryKey, context.previousData)
      }
      toast.error(
        resolveLocalizedError(err, {
          t: tr,
          fallbackKey: "dashboard.settings.sessions.revokeOthersError",
        }),
      )
    },
    onSuccess: (data) => {
      toast.success(t("revokeOthersSuccess", { count: data.revoked }))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: sessionsQueryKey })
    },
  })

  return {
    sessions: enrichedSessions,
    currentSession,
    otherSessions,
    isLoading: sessionsQuery.isLoading,
    revokeSession: (sessionId: string) =>
      revokeMutation.mutateAsync({ sessionId }),
    revokeOthers: () => revokeOthersMutation.mutateAsync(undefined),
    isRevoking: revokeMutation.isPending,
    isRevokingOthers: revokeOthersMutation.isPending,
  }
}
