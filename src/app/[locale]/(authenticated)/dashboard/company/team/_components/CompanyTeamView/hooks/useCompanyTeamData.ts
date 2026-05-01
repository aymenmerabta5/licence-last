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

  const inviteMutation = useMutation({
    ...orpc.companies.inviteMember.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: membersQueryOptions.queryKey,
      })
      const previousData = queryClient.getQueryData(membersQueryOptions.queryKey)
      queryClient.setQueryData(membersQueryOptions.queryKey, (old) => {
        if (!old) return old
        return [
          ...old,
          {
            userId: `optimistic-${Date.now()}`,
            email: variables.email,
            name: variables.name ?? null,
            role: "recruiter" as const,
            joinedAt: new Date(),
          },
        ]
      })
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          membersQueryOptions.queryKey,
          context.previousData,
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: membersQueryOptions.queryKey,
      })
    },
  })

  const removeMutation = useMutation({
    ...orpc.companies.removeMember.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: membersQueryOptions.queryKey,
      })
      const previousData = queryClient.getQueryData(membersQueryOptions.queryKey)
      queryClient.setQueryData(membersQueryOptions.queryKey, (old) => {
        if (!old) return old
        return old.filter((member) => member.userId !== variables.userId)
      })
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          membersQueryOptions.queryKey,
          context.previousData,
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: membersQueryOptions.queryKey,
      })
    },
  })

  return {
    members: membersQuery.data ?? [],
    isLoading: membersQuery.isLoading,
    isError: membersQuery.isError,
    error: membersQuery.error,
    refetch: membersQuery.refetch,
    inviteMutation,
    removeMutation,
  }
}
