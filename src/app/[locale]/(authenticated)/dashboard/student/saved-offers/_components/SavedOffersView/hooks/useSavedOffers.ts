"use client"

import {
  type QueryKey,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { useMemo } from "react"

import { orpc, orpcClient } from "@/server/orpc/client"

export function useSavedOffers() {
  const queryClient = useQueryClient()
  const savedQueryKey = useMemo(
    () => orpc.offers.listSaved.queryOptions().queryKey as QueryKey,
    [],
  )

  const savedOffersQuery = useInfiniteQuery({
    queryKey: savedQueryKey,
    queryFn: async ({ pageParam }) =>
      orpcClient.offers.listSaved({
        cursor: pageParam ?? undefined,
        limit: 12,
      }),
    initialPageParam: undefined as
      | { savedAt: string; offerId: string }
      | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const unsaveMutation = useMutation({
    ...orpc.offers.unsave.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: savedQueryKey })
      const previousData = queryClient.getQueryData(savedQueryKey)
      queryClient.setQueryData(savedQueryKey, (old) => {
        if (!old || typeof old !== "object" || !("pages" in old)) return old
        const data = old as {
          pages: Array<{ offers: Array<{ offerId: string }> }>
          pageParams: unknown[]
        }
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            offers: page.offers.filter((o) => o.offerId !== variables.offerId),
          })),
        }
      })
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(savedQueryKey, context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: savedQueryKey })
    },
  })

  const offers =
    savedOffersQuery.data?.pages.flatMap((page) => page.offers) ?? []

  return {
    offers,
    isLoading: savedOffersQuery.isLoading,
    isError: savedOffersQuery.isError,
    error: savedOffersQuery.error,
    hasNextPage: savedOffersQuery.hasNextPage,
    isFetchingNextPage: savedOffersQuery.isFetchingNextPage,
    fetchNextPage: savedOffersQuery.fetchNextPage,
    unsaveMutation,
  }
}
