"use client"

import { useQuery } from "@tanstack/react-query"

import type { UserSession } from "@/app/[locale]/(authenticated)/dashboard/admin/users/[userId]/_components/UserDetailView/types"
import { orpc } from "@/server/orpc/client"

function normalizeUserSessions(input: unknown): UserSession[] {
  const record =
    input && typeof input === "object"
      ? (input as { sessions?: unknown[] })
      : null
  const rawSessions = Array.isArray(input)
    ? input
    : Array.isArray(record?.sessions)
      ? record.sessions
      : []

  return rawSessions.flatMap((session: unknown) => {
    if (!session || typeof session !== "object") {
      return []
    }

    const record = session as Record<string, unknown>
    if (typeof record.id !== "string") {
      return []
    }

    const createdAt: UserSession["createdAt"] =
      typeof record.createdAt === "string" || record.createdAt instanceof Date
        ? record.createdAt
        : new Date(0)
    const expiresAt: UserSession["expiresAt"] =
      typeof record.expiresAt === "string" || record.expiresAt instanceof Date
        ? record.expiresAt
        : new Date(0)

    return [
      {
        id: record.id,
        tokenPrefix:
          typeof record.tokenPrefix === "string" ? record.tokenPrefix : null,
        ipAddress: typeof record.ipAddress === "string" ? record.ipAddress : null,
        userAgent: typeof record.userAgent === "string" ? record.userAgent : null,
        createdAt,
        expiresAt,
        impersonatedBy:
          typeof record.impersonatedBy === "string"
            ? record.impersonatedBy
            : null,
      },
    ]
  })
}

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

  const sessions = normalizeUserSessions(sessionsQuery.data)

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
