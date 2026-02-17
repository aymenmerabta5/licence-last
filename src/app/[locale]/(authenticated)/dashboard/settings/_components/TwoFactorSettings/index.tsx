"use client"

import { useTranslations } from "next-intl"
import { ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { useTwoFactorSetup } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/TwoFactorSettings/hooks/useTwoFactorSetup"
import { EnableFlow } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/TwoFactorSettings/components/EnableFlow"
import { BackupCodesDisplay } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/TwoFactorSettings/components/BackupCodesDisplay"
import { DisableConfirm } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/TwoFactorSettings/components/DisableConfirm"

interface TwoFactorSettingsProps {
  isTwoFactorEnabled: boolean
}

export function TwoFactorSettings({ isTwoFactorEnabled }: TwoFactorSettingsProps) {
  const t = useTranslations("dashboard.settings.twoFactor")
  const state = useTwoFactorSetup(isTwoFactorEnabled)

  return (
    <Card className="border-border/40 bg-background rounded-3xl overflow-hidden shadow-sm">
      <CardHeader className="px-8 pt-8 pb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/30 mt-0.5">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </span>
            <div className="space-y-0.5">
              <CardTitle className="font-serif text-xl tracking-tight">
                {t("title")}
              </CardTitle>
              <CardDescription className="font-medium text-[12px]">
                {t("description")}
              </CardDescription>
            </div>
          </div>
          <Badge
            className={`px-2.5 py-1 font-bold uppercase tracking-widest text-[9px] border-none shrink-0 ${
              isTwoFactorEnabled
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-secondary/50 text-muted-foreground"
            }`}
          >
            {isTwoFactorEnabled ? t("active") : t("inactive")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-8 pb-8 pt-0 space-y-6">
        {state.phase === "idle" && (
          <Button
            type="button"
            variant={isTwoFactorEnabled ? "editorial-outline" : "editorial"}
            size="editorial-sm"
            className="rounded-xl border-border/40 hover:border-heading ms-13"
            onClick={isTwoFactorEnabled ? state.startDisable : state.startEnable}
          >
            {isTwoFactorEnabled ? t("disable") : t("enable")}
          </Button>
        )}

        {(state.phase === "enabling" || state.phase === "verifying") && (
          <EnableFlow state={state} />
        )}

        {state.phase === "showBackupCodes" && (
          <BackupCodesDisplay codes={state.backupCodes} onDone={state.finishSetup} />
        )}

        {state.phase === "disabling" && <DisableConfirm state={state} />}
      </CardContent>
    </Card>
  )
}
