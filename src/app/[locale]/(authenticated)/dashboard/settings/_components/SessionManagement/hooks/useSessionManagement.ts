"use client"

import { useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { orpc } from "@/server/orpc/client"
import { parseUserAgent } from "@/lib/user-agent"
import { getErrorMessage } from "@/lib/error-message"
import type { EnrichedSession } from "../types"

export function useSessionManagement() {
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

  const revokeMutation = useMutation({
    ...orpc.users.revokeMySession.mutationOptions(),
    onSuccess: () => {
      toast.success(t("revokeSuccess"))
      queryClient.invalidateQueries({ queryKey: orpc.users.listMySessions.queryOptions().queryKey })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, t("revokeError")))
    },
  })

  const revokeOthersMutation = useMutation({
    ...orpc.users.revokeOtherSessions.mutationOptions(),
    onSuccess: (data) => {
      toast.success(t("revokeOthersSuccess", { count: data.revoked }))
      queryClient.invalidateQueries({ queryKey: orpc.users.listMySessions.queryOptions().queryKey })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, t("revokeOthersError")))
    },
  })

  return {
    sessions: enrichedSessions,
    currentSession,
    otherSessions,
    isLoading: sessionsQuery.isLoading,
    revokeSession: (token: string) => revokeMutation.mutateAsync({ sessionToken: token }),
    revokeOthers: () => revokeOthersMutation.mutateAsync(undefined),
    isRevoking: revokeMutation.isPending,
    isRevokingOthers: revokeOthersMutation.isPending,
  }
}
