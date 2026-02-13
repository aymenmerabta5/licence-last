"use client"

import { useQuery } from "@tanstack/react-query"

import { orpc } from "@/server/orpc/client"

export function useDepartmentsData(universityId: string | null) {
  const { data, isLoading, refetch } = useQuery({
    ...orpc.departments.list.queryOptions({
      input: { universityId: universityId ?? "" },
      enabled: !!universityId,
    }),
  })

  return {
    departments: data ?? [],
    isLoading,
    refetch,
  }
}
