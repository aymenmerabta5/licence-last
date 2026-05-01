"use client"

import { ShieldCheck } from "lucide-react"
import { useTranslations } from "next-intl"
import { BackupCodesDisplay } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/TwoFactorSettings/components/BackupCodesDisplay"
import { DisableConfirm } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/TwoFactorSettings/components/DisableConfirm"
import { EnableFlow } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/TwoFactorSettings/components/EnableFlow"
import { useTwoFactorSetup } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/TwoFactorSettings/hooks/useTwoFactorSetup"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TwoFactorSettingsProps {
  isTwoFactorEnabled: boolean
}

export function TwoFactorSettings({
  isTwoFactorEnabled,
}: TwoFactorSettingsProps) {
  const t = useTranslations("dashboard.settings.twoFactor")
  const state = useTwoFactorSetup(isTwoFactorEnabled)

  function handleOpenChange(open: boolean) {
    if (!open) state.cancel()
  }

  return (
    <>
      {/* Settings row — matches Security Baseline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-border/50 bg-muted/30 mt-0.5">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm font-medium text-heading">
              {t("title")}
            </h4>
            <p className="text-[11px] text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 ps-11 sm:ps-0">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] border ${
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
        </div>
      </div>

      <Dialog open={state.phase !== "idle"} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {state.phase === "enabling" && t("enableStep.title")}
              {state.phase === "verifying" && t("verifyStep.title")}
              {state.phase === "showBackupCodes" && t("backupCodes.title")}
              {state.phase === "disabling" && t("disableConfirm.title")}
            </DialogTitle>
            <DialogDescription>
              {state.phase === "enabling" && t("enableStep.description")}
              {state.phase === "verifying" && t("enableStep.scanQr")}
              {state.phase === "showBackupCodes" &&
                t("backupCodes.description")}
              {state.phase === "disabling" && t("disableConfirm.description")}
            </DialogDescription>
          </DialogHeader>

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
        </DialogContent>
      </Dialog>
    </>
  )
}
