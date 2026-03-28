"use client"

import { ShieldCheck } from "lucide-react"
import { useTranslations } from "next-intl"
import { BackupCodesDisplay } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/TwoFactorSettings/components/BackupCodesDisplay"
import { DisableConfirm } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/TwoFactorSettings/components/DisableConfirm"
import { EnableFlow } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/TwoFactorSettings/components/EnableFlow"
import { useTwoFactorSetup } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/TwoFactorSettings/hooks/useTwoFactorSetup"
import { Button } from "@/components/ui/button"

interface TwoFactorSettingsProps {
  isTwoFactorEnabled: boolean
}

export function TwoFactorSettings({
  isTwoFactorEnabled,
}: TwoFactorSettingsProps) {
  const t = useTranslations("dashboard.settings.twoFactor")
  const state = useTwoFactorSetup(isTwoFactorEnabled)

  return (
    <div className="border border-border/60 bg-card/30 dark:bg-card/50 overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/20 dark:bg-muted/10">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <h2 className="font-serif text-lg text-heading">{t("title")}</h2>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] border ${
            isTwoFactorEnabled
              ? "border-emerald-400/60 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border-border bg-muted text-muted-foreground"
          }`}
        >
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              isTwoFactorEnabled
                ? "bg-emerald-500 dark:bg-emerald-400"
                : "bg-muted-foreground/40"
            }`}
          />
          {isTwoFactorEnabled ? t("active") : t("inactive")}
        </span>
      </div>

      <div className="p-6 space-y-6">
        <p className="text-sm font-light text-muted-foreground">
          {t("description")}
        </p>

        {state.phase === "idle" && (
          <Button
            type="button"
            variant={isTwoFactorEnabled ? "editorial-outline" : "editorial"}
            size="editorial-sm"
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
      </div>
    </div>
  )
}
