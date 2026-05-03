"use client"

import type { InfiniteData } from "@tanstack/react-query"
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

type UniversityPage = { universities: UniversityListItem[]; hasMore: boolean }

function isInfiniteUniversityData(
  data: unknown,
): data is InfiniteData<UniversityPage> {
  return (
    typeof data === "object" &&
    data !== null &&
    "pages" in data &&
    Array.isArray((data as Record<string, unknown>).pages)
  )
}

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
      (data?.pages.flatMap((page) => page.universities) ??
        []) as UniversityListItem[],
    [data],
  )

  const sentinelRef = useInfiniteScroll(
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  )

  const invalidateUniversityQueries = () =>
    queryClient.invalidateQueries({ queryKey: universitiesQueryKey })

  const getUniversityListQueries = () =>
    queryClient.getQueriesData<unknown>({
      predicate: (query) => {
        const keyStr = JSON.stringify(query.queryKey)
        return keyStr.includes("universities") && keyStr.includes("list")
      },
    })

  const approveMutation = useMutation({
    mutationFn: (universityId: string) =>
      orpcClient.universities.approve({ universityId }),
    onMutate: async (universityId) => {
      await queryClient.cancelQueries({ queryKey: universitiesQueryKey })
      const previousQueries = getUniversityListQueries()
      previousQueries.forEach(([queryKey, data]) => {
        if (!data) return
        if (isInfiniteUniversityData(data)) {
          queryClient.setQueryData<InfiniteData<UniversityPage>>(
            queryKey,
            (old) => {
              if (!old) return old
              return {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  universities: page.universities.map((u) =>
                    u.id === universityId
                      ? { ...u, status: "approved" as const }
                      : u,
                  ),
                })),
              }
            },
          )
        } else {
          queryClient.setQueryData<UniversityPage>(queryKey, (old) => {
            if (!old) return old
            return {
              ...old,
              universities: old.universities.map((u) =>
                u.id === universityId
                  ? { ...u, status: "approved" as const }
                  : u,
              ),
            }
          })
        }
      })
      return { previousQueries }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error(t("approveError"))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: universitiesQueryKey })
    },
    onSuccess: () => {
      toast.success(t("approveSuccess"))
      invalidateUniversityQueries()
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
    onMutate: async ({ universityId }) => {
      await queryClient.cancelQueries({ queryKey: universitiesQueryKey })
      const previousQueries = getUniversityListQueries()
      previousQueries.forEach(([queryKey, data]) => {
        if (!data) return
        if (isInfiniteUniversityData(data)) {
          queryClient.setQueryData<InfiniteData<UniversityPage>>(
            queryKey,
            (old) => {
              if (!old) return old
              return {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  universities: page.universities.map((u) =>
                    u.id === universityId
                      ? { ...u, status: "rejected" as const }
                      : u,
                  ),
                })),
              }
            },
          )
        } else {
          queryClient.setQueryData<UniversityPage>(queryKey, (old) => {
            if (!old) return old
            return {
              ...old,
              universities: old.universities.map((u) =>
                u.id === universityId
                  ? { ...u, status: "rejected" as const }
                  : u,
              ),
            }
          })
        }
      })
      return { previousQueries }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error(t("rejectError"))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: universitiesQueryKey })
    },
    onSuccess: () => {
      toast.success(t("rejectSuccess"))
      invalidateUniversityQueries()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateUniversityPayload) =>
      orpcClient.universities.update(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: universitiesQueryKey })
      const previousQueries = getUniversityListQueries()
      previousQueries.forEach(([queryKey, data]) => {
        if (!data) return
        if (isInfiniteUniversityData(data)) {
          queryClient.setQueryData<InfiniteData<UniversityPage>>(
            queryKey,
            (old) => {
              if (!old) return old
              return {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  universities: page.universities.map((u) =>
                    u.id === payload.universityId
                      ? {
                          ...u,
                          ...(payload.name !== undefined && {
                            name: payload.name,
                          }),
                          ...(payload.abbreviation !== undefined && {
                            abbreviation: payload.abbreviation,
                          }),
                          ...(payload.phone !== undefined && {
                            phone: payload.phone,
                          }),
                          ...(payload.wilayaCode !== undefined && {
                            wilayaCode: payload.wilayaCode,
                          }),
                          ...(payload.city !== undefined && {
                            city: payload.city,
                          }),
                          ...(payload.address !== undefined && {
                            address: payload.address,
                          }),
                        }
                      : u,
                  ),
                })),
              }
            },
          )
        } else {
          queryClient.setQueryData<UniversityPage>(queryKey, (old) => {
            if (!old) return old
            return {
              ...old,
              universities: old.universities.map((u) =>
                u.id === payload.universityId
                  ? {
                      ...u,
                      ...(payload.name !== undefined && {
                        name: payload.name,
                      }),
                      ...(payload.abbreviation !== undefined && {
                        abbreviation: payload.abbreviation,
                      }),
                      ...(payload.phone !== undefined && {
                        phone: payload.phone,
                      }),
                      ...(payload.wilayaCode !== undefined && {
                        wilayaCode: payload.wilayaCode,
                      }),
                      ...(payload.city !== undefined && {
                        city: payload.city,
                      }),
                      ...(payload.address !== undefined && {
                        address: payload.address,
                      }),
                    }
                  : u,
              ),
            }
          })
        }
      })
      return { previousQueries }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error(t("updateError"))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: universitiesQueryKey })
    },
    onSuccess: () => {
      toast.success(t("updateSuccess"))
      invalidateUniversityQueries()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: ({ universityId }: { universityId: string }) =>
      orpcClient.universities.delete({ universityId }),
    onMutate: async ({ universityId }) => {
      await queryClient.cancelQueries({ queryKey: universitiesQueryKey })
      const previousQueries = getUniversityListQueries()
      previousQueries.forEach(([queryKey, data]) => {
        if (!data) return
        if (isInfiniteUniversityData(data)) {
          queryClient.setQueryData<InfiniteData<UniversityPage>>(
            queryKey,
            (old) => {
              if (!old) return old
              return {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  universities: page.universities.filter(
                    (u) => u.id !== universityId,
                  ),
                })),
              }
            },
          )
        } else {
          queryClient.setQueryData<UniversityPage>(queryKey, (old) => {
            if (!old) return old
            return {
              ...old,
              universities: old.universities.filter(
                (u) => u.id !== universityId,
              ),
            }
          })
        }
      })
      return { previousQueries }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error(t("deleteError"))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: universitiesQueryKey })
    },
    onSuccess: () => {
      toast.success(t("deleteSuccess"))
      invalidateUniversityQueries()
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
