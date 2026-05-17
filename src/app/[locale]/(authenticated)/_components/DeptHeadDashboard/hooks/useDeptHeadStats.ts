"use client"

import { useQuery } from "@tanstack/react-query"
import { orpc } from "@/server/orpc/client"

export interface DeptHeadStats {
  totalStudents: number
  pendingValidations: number
  activeInternships: number
  studentsWithoutInternship: number
}

const defaultStats: DeptHeadStats = {
  totalStudents: 0,
  pendingValidations: 0,
  activeInternships: 0,
  studentsWithoutInternship: 0,
}

export function useDeptHeadStats() {
  const { data, isLoading } = useQuery(
    orpc.deptHead.getDashboardStats.queryOptions({
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }),
  )

  const stats = (data ?? defaultStats) as DeptHeadStats

  return { stats, isLoading }
}
