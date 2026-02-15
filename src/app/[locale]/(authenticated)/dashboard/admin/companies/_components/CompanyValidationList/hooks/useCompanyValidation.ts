"use client"

import { useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { orpc, orpcClient } from "@/server/orpc/client"
import type { CompanyStatus } from "@/lib/schemas/enums"

export function useCompanyValidation() {
  const t = useTranslations("dashboard.admin.companies")
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | "all">("pending")

  const queryOptions = useMemo(
    () =>
      orpc.companies.list.queryOptions({
        input: statusFilter === "all" ? {} : { status: statusFilter },
      }),
    [statusFilter],
  )

  const { data, isLoading } = useQuery(queryOptions)

  const approveMutation = useMutation({
    mutationFn: (companyId: string) =>
      orpcClient.companies.approve({ companyId }),
    onSuccess: () => {
      toast.success(t("approveSuccess"))
      queryClient.invalidateQueries({ queryKey: queryOptions.queryKey })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ companyId, reason }: { companyId: string; reason: string }) =>
      orpcClient.companies.reject({ companyId, reason }),
    onSuccess: () => {
      toast.success(t("rejectSuccess"))
      queryClient.invalidateQueries({ queryKey: queryOptions.queryKey })
    },
  })

  return {
    companies: data?.companies ?? [],
    hasMore: data?.hasMore ?? false,
    isLoading,
    statusFilter,
    setStatusFilter,
    approveCompany: approveMutation.mutate,
    isApproving: approveMutation.isPending,
    rejectCompany: rejectMutation.mutate,
    isRejecting: rejectMutation.isPending,
  }
}
