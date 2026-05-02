"use client"

import { useTranslations } from "next-intl"
import { useQuery, useMutation } from "@tanstack/react-query"
import { orpc } from "@/server/orpc/client"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"

export function SiteSettingsView() {
  const t = useTranslations("admin")

  const { data, isLoading } = useQuery(
    orpc.adminSettings.getMaintenanceMode.queryOptions()
  )
  const { mutateAsync, isPending } = useMutation(
    orpc.adminSettings.setMaintenanceMode.mutationOptions({
      onSuccess: () => {
        toast.success(t("maintenanceModeSaved"))
      },
    })
  )

  const isMaintenanceMode = data?.enabled ?? false

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("siteSettings")}
        </h1>
      </div>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-medium">{t("maintenanceMode")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("maintenanceModeDescription")}
            </p>
          </div>
          <Switch
            checked={isMaintenanceMode}
            onCheckedChange={(checked: boolean) => mutateAsync({ enabled: checked })}
            disabled={isLoading || isPending}
          />
        </div>
      </div>
    </div>
  )
}
