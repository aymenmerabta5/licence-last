"use client"

import { ShieldCheck } from "lucide-react"
import { useTranslations } from "next-intl"
import { BackupCodesDisplay } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/TwoFactorSettings/components/BackupCodesDisplay"
import { DisableConfirm } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/TwoFactorSettings/components/DisableConfirm"
import { EnableFlow } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/TwoFactorSettings/components/EnableFlow"

import { useTwoFactorSetup } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/TwoFactorSettings/hooks/useTwoFactorSetup"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface TwoFactorSettingsProps {
  isTwoFactorEnabled: boolean
}

export function TwoFactorSettings({
  isTwoFactorEnabled,
}: TwoFactorSettingsProps) {
  const t = useTranslations("dashboard.settings.twoFactor")
  const state = useTwoFactorSetup(isTwoFactorEnabled)

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-75 fill-mode-both">
      <Card className="border-border/60 bg-background/60 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-sm shadow-black/5 ring-1 ring-border/10">
        <CardHeader className="relative overflow-hidden px-8 pt-10 pb-8 sm:px-12 sm:pt-12 sm:pb-10 bg-gradient-to-b from-muted/80 via-muted/30 to-transparent">
          <div
            className="absolute -top-12 -end-8 flex items-center opacity-[0.02] dark:opacity-[0.05] pointer-events-none scale-[2] rotate-12"
            aria-hidden="true"
          >
            <ShieldCheck className="h-64 w-64 text-primary" />
          </div>

          <div className="relative z-10 flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <CardTitle className="font-serif text-3xl sm:text-4xl text-heading tracking-tight">
                {t("title")}
              </CardTitle>
            </div>
            <Badge
              className={`px-3 py-1 font-mono font-bold uppercase tracking-widest text-[9px] border ${
                isTwoFactorEnabled
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                  : "bg-foreground text-background border-foreground/20"
              }`}
            >
              {isTwoFactorEnabled ? t("active") : t("inactive")}
            </Badge>
          </div>
          <CardDescription className="relative z-10 text-base font-medium text-muted-foreground/80 sm:ps-16 max-w-xl">
            {t("description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8 pt-4 sm:px-12 sm:pb-12 sm:pt-6 space-y-8">
          {state.phase === "idle" && (
            <Button
              type="button"
              variant={isTwoFactorEnabled ? "editorial-outline" : "editorial"}
              size="editorial-sm"
              className="rounded-xl border-border/40 hover:border-heading ms-13"
              onClick={
                isTwoFactorEnabled ? state.startDisable : state.startEnable
              }
            >
              {isTwoFactorEnabled ? t("disable") : t("enable")}
            </Button>
          )}

          {(state.phase === "enabling" || state.phase === "verifying") && (
            <EnableFlow state={state} />
          )}

          {state.phase === "showBackupCodes" && (
            <BackupCodesDisplay
              codes={state.backupCodes}
              onDone={state.finishSetup}
            />
          )}

          {state.phase === "disabling" && <DisableConfirm state={state} />}
        </CardContent>
      </Card>
    </div>
  )
}
