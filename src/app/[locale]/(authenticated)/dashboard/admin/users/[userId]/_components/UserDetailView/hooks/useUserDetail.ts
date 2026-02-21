"use client"

import { useQuery } from "@tanstack/react-query"

import type { UserSession } from "@/app/[locale]/(authenticated)/dashboard/admin/users/[userId]/_components/UserDetailView/types"
import { orpc } from "@/server/orpc/client"

export function useUserDetail(userId: string) {
  const userQuery = useQuery(
    orpc.adminUsers.list.queryOptions({
      input: {
        limit: 1,
        offset: 0,
        filterField: "id",
        filterValue: userId,
        filterOperator: "eq",
      },
    }),
  )

  const sessionsQuery = useQuery(
    orpc.adminUsers.listSessions.queryOptions({
      input: { userId },
    }),
  )

  const user = userQuery.data?.users?.[0] ?? null

  const sessionsData = sessionsQuery.data
  const sessions = Array.isArray(sessionsData)
    ? (sessionsData as UserSession[])
    : Array.isArray(
          (
            sessionsData as
              | { sessions?: UserSession[] }
              | null
              | undefined
          )?.sessions,
        )
      ? ((sessionsData as { sessions?: UserSession[] }).sessions ?? [])
      : []

  return {
    user,
    sessions,
    isLoading: userQuery.isLoading,
    sessionsLoading: sessionsQuery.isLoading,
    refetch: () => {
      userQuery.refetch()
      sessionsQuery.refetch()
    },
  }
}
