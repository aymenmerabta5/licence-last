"use client"

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { useMemo } from "react"

import { orpc, orpcClient } from "@/server/orpc/client"

export function useSavedOffers() {
  const queryClient = useQueryClient()
  const savedQueryKey = useMemo(
    () => orpc.offers.listSaved.queryOptions().queryKey,
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
    ...orpc.offers.unsave.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: savedQueryKey })
      },
    }),
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
