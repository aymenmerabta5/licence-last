"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { orpc } from "@/server/orpc/client"

export function useSiteSettings() {
  const t = useTranslations("admin")
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(
    orpc.adminSettings.getMaintenanceMode.queryOptions(),
  )

  const { mutateAsync, isPending } = useMutation(
    orpc.adminSettings.setMaintenanceMode.mutationOptions({
      onSuccess: () => {
        toast.success(t("maintenanceModeSaved"))
        void queryClient.invalidateQueries({
          queryKey:
            orpc.adminSettings.getMaintenanceMode.queryOptions().queryKey,
        })
      },
    }),
  )

  return {
    isMaintenanceMode: data?.enabled ?? false,
    isLoading,
    setMaintenanceMode: mutateAsync,
    isPending,
  }
}
