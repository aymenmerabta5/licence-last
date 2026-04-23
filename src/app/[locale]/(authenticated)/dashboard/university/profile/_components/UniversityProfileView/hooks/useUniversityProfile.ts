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
    }) => orpcClient.universities.updateMyUniversity(input),
    onSuccess: () => {
      toast.success(t("updateSuccess"))
      invalidate()
    },
    onError: () => {
      toast.error(t("updateError"))
    },
  })

  const addDomainMutation = useMutation({
    mutationFn: (domain: string) =>
      orpcClient.universities.addDomain({ domain }),
    onSuccess: () => {
      toast.success(t("addDomainSuccess"))
      invalidate()
    },
    onError: () => {
      toast.error(t("addDomainError"))
    },
  })

  const removeDomainMutation = useMutation({
    mutationFn: (domainId: string) =>
      orpcClient.universities.removeDomain({ domainId }),
    onSuccess: () => {
      toast.success(t("removeDomainSuccess"))
      invalidate()
    },
    onError: () => {
      toast.error(t("removeDomainError"))
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
  }
}
