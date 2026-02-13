"use client"

import { useQuery } from "@tanstack/react-query"

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

  // The listUserSessions API returns sessions nested in the response
  const sessionsData = sessionsQuery.data
  const sessions = Array.isArray(sessionsData) ? sessionsData : []

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
