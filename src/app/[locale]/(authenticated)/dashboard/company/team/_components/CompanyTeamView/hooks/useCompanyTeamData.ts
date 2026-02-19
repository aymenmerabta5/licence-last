"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"

import { orpc } from "@/server/orpc/client"

export function useCompanyTeamData() {
  const queryClient = useQueryClient()
  const membersQueryOptions = useMemo(
    () => orpc.companies.listMembers.queryOptions(),
    [],
  )

  const membersQuery = useQuery(membersQueryOptions)

  const inviteMutation = useMutation(
    orpc.companies.inviteMember.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: membersQueryOptions.queryKey,
        })
      },
    }),
  )

  const removeMutation = useMutation(
    orpc.companies.removeMember.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: membersQueryOptions.queryKey,
        })
      },
    }),
  )

  return {
    members: membersQuery.data ?? [],
    isLoading: membersQuery.isLoading,
    isError: membersQuery.isError,
    error: membersQuery.error,
    inviteMutation,
    removeMutation,
  }
}
