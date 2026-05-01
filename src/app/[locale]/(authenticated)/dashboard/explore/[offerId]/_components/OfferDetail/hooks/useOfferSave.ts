"use client"

import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query"
import { useMemo } from "react"

import { isSavedOffersEnabledOnClient } from "@/lib/feature-flags-client"
import { orpc } from "@/server/orpc/client"

function isDisabledFeatureError(error: unknown) {
  if (!(error instanceof Error)) return false
  return /disabled/i.test(error.message)
}

interface ListSavedPage {
  offers: Array<{ offerId: string }>
}

export function useOfferSave(offerId: string) {
  const queryClient = useQueryClient()
  const savedOffersEnabled = isSavedOffersEnabledOnClient()
  const checkQueryOptions = useMemo(
    () => orpc.offers.checkSaved.queryOptions({ input: { offerId } }),
    [offerId],
  )

  const listSavedQueryKey = useMemo(
    () => orpc.offers.listSaved.queryOptions().queryKey as QueryKey,
    [],
  )

  const checkQuery = useQuery({
    ...checkQueryOptions,
    enabled: savedOffersEnabled,
  })

  const saveMutation = useMutation({
    ...orpc.offers.save.mutationOptions(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: checkQueryOptions.queryKey })
      await queryClient.cancelQueries({ queryKey: listSavedQueryKey })
      const previousCheckData = queryClient.getQueryData(checkQueryOptions.queryKey)

      queryClient.setQueryData(checkQueryOptions.queryKey, { saved: true })

      return { previousCheckData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCheckData) {
        queryClient.setQueryData(checkQueryOptions.queryKey, context.previousCheckData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: checkQueryOptions.queryKey })
      queryClient.invalidateQueries({ queryKey: listSavedQueryKey })
    },
  })

  const unsaveMutation = useMutation({
    ...orpc.offers.unsave.mutationOptions(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: checkQueryOptions.queryKey })
      await queryClient.cancelQueries({ queryKey: listSavedQueryKey })
      const previousCheckData = queryClient.getQueryData(checkQueryOptions.queryKey)
      const previousListData = queryClient.getQueryData(listSavedQueryKey)

      queryClient.setQueryData(checkQueryOptions.queryKey, { saved: false })

      queryClient.setQueryData(listSavedQueryKey, (old) => {
        if (!old || typeof old !== "object" || !("pages" in old)) return old
        const data = old as { pages: ListSavedPage[]; pageParams: unknown[] }
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            offers: page.offers.filter((o) => o.offerId !== offerId),
          })),
        }
      })

      return { previousCheckData, previousListData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCheckData) {
        queryClient.setQueryData(checkQueryOptions.queryKey, context.previousCheckData)
      }
      if (context?.previousListData) {
        queryClient.setQueryData(listSavedQueryKey, context.previousListData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: checkQueryOptions.queryKey })
      queryClient.invalidateQueries({ queryKey: listSavedQueryKey })
    },
  })

  const unavailable =
    !savedOffersEnabled || isDisabledFeatureError(checkQuery.error)
  const isSaved = savedOffersEnabled ? (checkQuery.data?.saved ?? false) : false

  return {
    isSaved,
    unavailable,
    isChecking: savedOffersEnabled ? checkQuery.isLoading : false,
    isMutating: saveMutation.isPending || unsaveMutation.isPending,
    toggleSaved: async () => {
      if (unavailable) return

      if (isSaved) {
        await unsaveMutation.mutateAsync({ offerId })
      } else {
        await saveMutation.mutateAsync({ offerId })
      }
    },
  }
}
