"use client"

import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { isSavedOffersEnabledOnClient } from "@/lib/feature-flags-client"
import { orpc } from "@/server/orpc/client"

function isDisabledFeatureError(error: unknown) {
  if (!(error instanceof Error)) return false
  return /disabled/i.test(error.message)
}

export function useOfferSave(offerId: string) {
  const queryClient = useQueryClient()
  const savedOffersEnabled = isSavedOffersEnabledOnClient()
  const checkQueryOptions = useMemo(
    () => orpc.offers.checkSaved.queryOptions({ input: { offerId } }),
    [offerId],
  )

  const listSavedQueryKey = useMemo(
    () => orpc.offers.listSaved.queryOptions().queryKey,
    [],
  )

  const checkQuery = useQuery({
    ...checkQueryOptions,
    enabled: savedOffersEnabled,
  })

  const saveMutation = useMutation(
    orpc.offers.save.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: checkQueryOptions.queryKey })
        await queryClient.invalidateQueries({ queryKey: listSavedQueryKey })
      },
    }),
  )

  const unsaveMutation = useMutation(
    orpc.offers.unsave.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: checkQueryOptions.queryKey })
        await queryClient.invalidateQueries({ queryKey: listSavedQueryKey })
      },
    }),
  )

  const unavailable = !savedOffersEnabled || isDisabledFeatureError(checkQuery.error)
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
