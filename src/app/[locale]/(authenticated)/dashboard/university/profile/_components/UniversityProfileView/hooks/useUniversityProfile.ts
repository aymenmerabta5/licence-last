"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { orpc, orpcClient } from "@/server/orpc/client"

export function useUniversityProfile() {
  const t = useTranslations("dashboard.universityProfile")
  const queryClient = useQueryClient()

  const meQuery = useQuery(orpc.users.getMe.queryOptions())
  const universityId = meQuery.data?.university?.id

  const universityQuery = useQuery({
    ...orpc.universities.getById.queryOptions({
      input: { universityId: universityId ?? "" },
    }),
    enabled: !!universityId,
  })

  const domainsQuery = useQuery({
    ...orpc.universities.listMyDomains.queryOptions(),
    enabled: !!universityId,
  })

  const invalidate = () => {
    if (universityId) {
      queryClient.invalidateQueries({
        queryKey: orpc.universities.getById.queryOptions({
          input: { universityId },
        }).queryKey,
      })
    }
    queryClient.invalidateQueries({
      queryKey: orpc.universities.listMyDomains.queryOptions().queryKey,
    })
  }

  const updateMutation = useMutation({
    mutationFn: (input: {
      name?: string
      abbreviation?: string | null
      phone?: string | null
      wilayaCode?: number | null
      city?: string | null
      address?: string | null
      logoUrl?: string | null
    }) => orpcClient.universities.updateMyUniversity(input),
    onMutate: async (variables) => {
      if (!universityId) return
      const queryKey = orpc.universities.getById.queryOptions({
        input: { universityId },
      }).queryKey
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          name: variables.name ?? old.name,
          abbreviation: variables.abbreviation ?? old.abbreviation,
          phone: variables.phone ?? old.phone,
          wilayaCode: variables.wilayaCode ?? old.wilayaCode,
          city: variables.city ?? old.city,
          address: variables.address ?? old.address,
          logoUrl: variables.logoUrl ?? old.logoUrl,
        }
      })
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (!universityId) return
      const queryKey = orpc.universities.getById.queryOptions({
        input: { universityId },
      }).queryKey
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      toast.error(t("updateError"))
    },
    onSuccess: () => {
      toast.success(t("updateSuccess"))
    },
    onSettled: () => {
      invalidate()
    },
  })

  const addDomainMutation = useMutation({
    mutationFn: (domain: string) =>
      orpcClient.universities.addDomain({ domain }),
    onMutate: async (variables) => {
      const queryKey = orpc.universities.listMyDomains.queryOptions().queryKey
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old
        return [
          ...old,
          {
            id: crypto.randomUUID(),
            domain: variables,
            status: "pending",
            createdAt: new Date(),
          },
        ]
      })
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      const queryKey = orpc.universities.listMyDomains.queryOptions().queryKey
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      toast.error(t("addDomainError"))
    },
    onSuccess: () => {
      toast.success(t("addDomainSuccess"))
    },
    onSettled: () => {
      invalidate()
    },
  })

  const removeDomainMutation = useMutation({
    mutationFn: (domainId: string) =>
      orpcClient.universities.removeDomain({ domainId }),
    onMutate: async (variables) => {
      const queryKey = orpc.universities.listMyDomains.queryOptions().queryKey
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old
        return old.filter((d) => d.id !== variables)
      })
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      const queryKey = orpc.universities.listMyDomains.queryOptions().queryKey
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      toast.error(t("removeDomainError"))
    },
    onSuccess: () => {
      toast.success(t("removeDomainSuccess"))
    },
    onSettled: () => {
      invalidate()
    },
  })

  return {
    university: universityQuery.data,
    domains: domainsQuery.data ?? [],
    isLoading:
      meQuery.isLoading || universityQuery.isLoading || domainsQuery.isLoading,
    updateUniversity: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    addDomain: addDomainMutation.mutate,
    isAddingDomain: addDomainMutation.isPending,
    removeDomain: removeDomainMutation.mutate,
    isRemovingDomain: removeDomainMutation.isPending,
    invalidate,
  }
}
