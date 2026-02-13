"use client"

import { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { useTwoFactorSetup } from "./hooks/useTwoFactorSetup"
import { EnableFlow } from "./components/EnableFlow"
import { BackupCodesDisplay } from "./components/BackupCodesDisplay"
import { DisableConfirm } from "./components/DisableConfirm"

interface TwoFactorSettingsProps {
  isTwoFactorEnabled: boolean
}

export function TwoFactorSettings({ isTwoFactorEnabled }: TwoFactorSettingsProps) {
  const t = useTranslations("dashboard.settings.twoFactor")
  const state = useTwoFactorSetup(isTwoFactorEnabled)

  return (
    <Card className="border-border/40 bg-background rounded-3xl overflow-hidden shadow-sm">
      <CardHeader className="p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="font-serif text-2xl">{t("title")}</CardTitle>
            <CardDescription className="font-medium">
              {t("description")}
            </CardDescription>
          </div>
          <Badge
            className={`px-3 py-1 font-bold uppercase tracking-widest text-[9px] border-none ${
              isTwoFactorEnabled
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-secondary/50 text-muted-foreground"
            }`}
          >
            {isTwoFactorEnabled ? t("active") : t("inactive")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-0 space-y-6">
        {state.phase === "idle" && (
          <Button
            type="button"
            variant={isTwoFactorEnabled ? "editorial-outline" : "editorial"}
            className="rounded-xl h-11 border-border/40 hover:border-heading"
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
