"use client"

import { useQuery } from "@tanstack/react-query"

import { orpc } from "@/server/orpc/client"

export function useCommandCenterData() {
  const usersQuery = useQuery(
    orpc.adminUsers.list.queryOptions({
      input: { limit: 1, offset: 0 },
    }),
  )

  const bannedQuery = useQuery(
    orpc.adminUsers.list.queryOptions({
      input: {
        limit: 1,
        offset: 0,
        filterField: "banned",
        filterValue: true,
        filterOperator: "eq",
      },
    }),
  )

  const recentUsersQuery = useQuery(
    orpc.adminUsers.list.queryOptions({
      input: {
        limit: 5,
        offset: 0,
        sortBy: "createdAt",
        sortDirection: "desc",
      },
    }),
  )

  return {
    totalUsers: usersQuery.data?.total ?? 0,
    bannedUsers: bannedQuery.data?.total ?? 0,
    recentUsers: recentUsersQuery.data?.users ?? [],
    isLoading: usersQuery.isLoading || bannedQuery.isLoading || recentUsersQuery.isLoading,
  }
}
