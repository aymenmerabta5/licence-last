"use client"

import { useQuery } from "@tanstack/react-query"

import { orpc } from "@/server/orpc/client"

import type { DepartmentItem } from "../types"

export function useDepartmentsData() {
  const { data: me, isLoading: isMeLoading } = useQuery(
    orpc.users.getMe.queryOptions(),
  )
  const universityId = me?.university?.id ?? null

  const { data, isLoading: isDepartmentsLoading, refetch } = useQuery({
    ...orpc.departments.list.queryOptions({
      input: { universityId: universityId ?? "" },
      enabled: !!universityId,
    }),
  })

  return {
    universityId,
    departments: (data ?? []) as DepartmentItem[],
    isLoading: isMeLoading || (Boolean(universityId) && isDepartmentsLoading),
    refetch,
  }
}
