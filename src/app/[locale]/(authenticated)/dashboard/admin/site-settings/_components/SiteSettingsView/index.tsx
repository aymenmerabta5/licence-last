"use client"

import { useTranslations } from "next-intl"

import { Switch } from "@/components/ui/switch"

import { useSiteSettings } from "@/app/[locale]/(authenticated)/dashboard/admin/site-settings/_components/SiteSettingsView/hooks/useSiteSettings"

export function SiteSettingsView() {
  const t = useTranslations("admin")
  const { isMaintenanceMode, isLoading, setMaintenanceMode, isPending } =
    useSiteSettings()

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
            onCheckedChange={(checked: boolean) =>
              setMaintenanceMode({ enabled: checked })
            }
            disabled={isLoading || isPending}
          />
        </div>
      </div>
    </div>
  )
}
