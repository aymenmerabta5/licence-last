"use client"

import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { orpc } from "@/server/orpc/client"

function isDisabledFeatureError(error: unknown) {
  if (!(error instanceof Error)) return false
  return /disabled/i.test(error.message)
}

export function useOfferSave(offerId: string) {
  const queryClient = useQueryClient()
  const checkQueryOptions = useMemo(
    () => orpc.offers.checkSaved.queryOptions({ input: { offerId } }),
    [offerId],
  )

  const listSavedQueryKey = useMemo(
    () => orpc.offers.listSaved.queryOptions().queryKey,
    [],
  )

  const checkQuery = useQuery(checkQueryOptions)

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

  const unavailable = isDisabledFeatureError(checkQuery.error)
  const isSaved = checkQuery.data?.saved ?? false

  return {
    isSaved,
    unavailable,
    isChecking: checkQuery.isLoading,
    isMutating: saveMutation.isPending || unsaveMutation.isPending,
    toggleSaved: async () => {
      if (isSaved) {
        await unsaveMutation.mutateAsync({ offerId })
      } else {
        await saveMutation.mutateAsync({ offerId })
      }
    },
  }
}
