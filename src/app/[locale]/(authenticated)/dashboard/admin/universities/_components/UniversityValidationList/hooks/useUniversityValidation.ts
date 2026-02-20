"use client"

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import type {
  UniversityListItem,
  UpdateUniversityPayload,
} from "@/app/[locale]/(authenticated)/dashboard/admin/universities/_components/UniversityValidationList/types"
import { useDebounce, useInfiniteScroll } from "@/hooks"
import type { UniversityStatus } from "@/lib/schemas/enums"
import { orpc, orpcClient } from "@/server/orpc/client"

const PAGE_SIZE = 20

export function useUniversityValidation() {
  const t = useTranslations("dashboard.admin.universities")
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<UniversityStatus | "all">(
    "pending",
  )
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)

  const universitiesQueryKey = useMemo(
    () => orpc.universities.list.queryOptions().queryKey,
    [],
  )

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: [
        ...universitiesQueryKey,
        "validation",
        statusFilter,
        debouncedSearch,
      ],
      queryFn: async ({ pageParam }) =>
        orpcClient.universities.list({
          status: statusFilter === "all" ? undefined : statusFilter,
          search: debouncedSearch || undefined,
          limit: PAGE_SIZE,
          offset: pageParam as number,
        }),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage.hasMore) return undefined
        return allPages.reduce(
          (total, page) => total + page.universities.length,
          0,
        )
      },
    })

  const universities = useMemo(
    () =>
      (data?.pages.flatMap((page) => page.universities) ?? []) as UniversityListItem[],
    [data],
  )

  const sentinelRef = useInfiniteScroll(
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  )

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
    mutationFn: ({
      universityId,
      reason,
    }: {
      universityId: string
      reason: string
    }) => orpcClient.universities.reject({ universityId, reason }),
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
    universities,
    hasMore: hasNextPage ?? false,
    isLoading,
    isFetchingNextPage,
    sentinelRef,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
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
