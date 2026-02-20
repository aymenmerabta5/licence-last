"use client"

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import type { CompanyListItem } from "@/app/[locale]/(authenticated)/dashboard/admin/companies/_components/CompanyValidationList/types"
import { useDebounce, useInfiniteScroll } from "@/hooks"
import type { CompanyStatus } from "@/lib/schemas/enums"
import { orpc, orpcClient } from "@/server/orpc/client"

const PAGE_SIZE = 20

export function useCompanyValidation() {
  const t = useTranslations("dashboard.admin.companies")
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | "all">(
    "pending",
  )
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)

  const listInput = useMemo<{ status?: CompanyStatus; search?: string }>(
    () => ({
      ...(statusFilter === "all" ? {} : { status: statusFilter }),
      ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
    }),
    [statusFilter, debouncedSearch],
  )

  const queryKey = useMemo(
    () => orpc.companies.list.queryOptions({ input: listInput }).queryKey,
    [listInput],
  )

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey,
      queryFn: async ({ pageParam }) =>
        orpcClient.companies.list({
          ...listInput,
          limit: PAGE_SIZE,
          offset: pageParam as number,
        }),
      initialPageParam: 0,
      getNextPageParam: (lastPage, pages) => {
        if (!lastPage.hasMore) {
          return undefined
        }

        return pages.reduce(
          (nextOffset, page) => nextOffset + page.companies.length,
          0,
        )
      },
    })

  const companies = useMemo(
    () => (data?.pages.flatMap((page) => page.companies) ?? []) as CompanyListItem[],
    [data],
  )

  const sentinelRef = useInfiniteScroll(
    () => {
      void fetchNextPage()
    },
    hasNextPage,
    isFetchingNextPage,
  )

  const approveMutation = useMutation({
    mutationFn: (companyId: string) =>
      orpcClient.companies.approve({ companyId }),
    onSuccess: () => {
      toast.success(t("approveSuccess"))
      queryClient.invalidateQueries({ queryKey })
    },
    onError: () => {
      toast.error(t("approveError"))
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({
      companyId,
      reason,
    }: {
      companyId: string
      reason: string
    }) => orpcClient.companies.reject({ companyId, reason }),
    onSuccess: () => {
      toast.success(t("rejectSuccess"))
      queryClient.invalidateQueries({ queryKey })
    },
    onError: () => {
      toast.error(t("rejectError"))
    },
  })

  const suspendMutation = useMutation({
    mutationFn: (companyId: string) =>
      orpcClient.companies.suspend({ companyId }),
    onSuccess: () => {
      toast.success(t("suspendSuccess"))
      queryClient.invalidateQueries({ queryKey })
    },
    onError: () => {
      toast.error(t("suspendError"))
    },
  })

  const reactivateMutation = useMutation({
    mutationFn: (companyId: string) =>
      orpcClient.companies.reactivate({ companyId }),
    onSuccess: () => {
      toast.success(t("reactivateSuccess"))
      queryClient.invalidateQueries({ queryKey })
    },
    onError: () => {
      toast.error(t("reactivateError"))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: ({ companyId }: { companyId: string }) =>
      orpcClient.companies.delete({ companyId }),
    onSuccess: () => {
      toast.success(t("deleteSuccess"))
      queryClient.invalidateQueries({ queryKey })
    },
    onError: () => {
      toast.error(t("deleteError"))
    },
  })

  return {
    companies,
    hasMore: hasNextPage ?? false,
    isLoading,
    isFetchingNextPage,
    sentinelRef,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    approveCompany: approveMutation.mutate,
    isApproving: approveMutation.isPending,
    rejectCompany: rejectMutation.mutate,
    isRejecting: rejectMutation.isPending,
    suspendCompany: suspendMutation.mutate,
    isSuspending: suspendMutation.isPending,
    reactivateCompany: reactivateMutation.mutate,
    isReactivating: reactivateMutation.isPending,
    deleteCompany: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  }
}
