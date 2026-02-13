"use client"

import { useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { orpc, orpcClient } from "@/server/orpc/client"
import type { UniversityStatus } from "@/lib/schemas/enums"

export function useUniversityValidation() {
  const t = useTranslations("dashboard.admin.universities")
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<UniversityStatus | "all">("pending")

  const queryOptions = useMemo(
    () =>
      orpc.universities.list.queryOptions({
        input: statusFilter === "all" ? {} : { status: statusFilter },
      }),
    [statusFilter],
  )

  const { data, isLoading } = useQuery(queryOptions)

  const approveMutation = useMutation({
    mutationFn: (universityId: string) =>
      orpcClient.universities.approve({ universityId }),
    onSuccess: () => {
      toast.success(t("approveSuccess"))
      queryClient.invalidateQueries({ queryKey: queryOptions.queryKey })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ universityId, reason }: { universityId: string; reason: string }) =>
      orpcClient.universities.reject({ universityId, reason }),
    onSuccess: () => {
      toast.success(t("rejectSuccess"))
      queryClient.invalidateQueries({ queryKey: queryOptions.queryKey })
    },
  })

  return {
    universities: data?.universities ?? [],
    hasMore: data?.hasMore ?? false,
    isLoading,
    statusFilter,
    setStatusFilter,
    approveUniversity: approveMutation.mutate,
    isApproving: approveMutation.isPending,
    rejectUniversity: rejectMutation.mutate,
    isRejecting: rejectMutation.isPending,
  }
}
