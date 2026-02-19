"use client"

import { useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { orpc, orpcClient } from "@/server/orpc/client"
import type { UniversityStatus } from "@/lib/schemas/enums"
import type {
  UniversityListItem,
  UpdateUniversityPayload,
} from "@/app/[locale]/(authenticated)/dashboard/admin/universities/_components/UniversityValidationList/types"

export function useUniversityValidation() {
  const t = useTranslations("dashboard.admin.universities")
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<UniversityStatus | "all">("pending")
  const universitiesQueryKey = useMemo(
    () => orpc.universities.list.queryOptions().queryKey,
    [],
  )

  const queryOptions = useMemo(
    () =>
      orpc.universities.list.queryOptions({
        input: statusFilter === "all" ? {} : { status: statusFilter },
      }),
    [statusFilter],
  )

  const { data, isLoading } = useQuery(queryOptions)

  const invalidateUniversityQueries = () =>
    queryClient.invalidateQueries({ queryKey: universitiesQueryKey })

  const approveMutation = useMutation({
    mutationFn: (universityId: string) =>
      orpcClient.universities.approve({ universityId }),
    onSuccess: () => {
      toast.success(t("approveSuccess"))
      invalidateUniversityQueries()
    },
    onError: () => {
      toast.error(t("approveError"))
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ universityId, reason }: { universityId: string; reason: string }) =>
      orpcClient.universities.reject({ universityId, reason }),
    onSuccess: () => {
      toast.success(t("rejectSuccess"))
      invalidateUniversityQueries()
    },
    onError: () => {
      toast.error(t("rejectError"))
    },
  })

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateUniversityPayload) =>
      orpcClient.universities.update(payload),
    onSuccess: () => {
      toast.success(t("updateSuccess"))
      invalidateUniversityQueries()
    },
    onError: () => {
      toast.error(t("updateError"))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: ({ universityId }: { universityId: string }) =>
      orpcClient.universities.delete({ universityId }),
    onSuccess: () => {
      toast.success(t("deleteSuccess"))
      invalidateUniversityQueries()
    },
    onError: () => {
      toast.error(t("deleteError"))
    },
  })

  return {
    universities: (data?.universities ?? []) as UniversityListItem[],
    hasMore: data?.hasMore ?? false,
    isLoading,
    statusFilter,
    setStatusFilter,
    approveUniversity: approveMutation.mutate,
    isApproving: approveMutation.isPending,
    rejectUniversity: rejectMutation.mutate,
    isRejecting: rejectMutation.isPending,
    updateUniversity: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteUniversity: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  }
}
