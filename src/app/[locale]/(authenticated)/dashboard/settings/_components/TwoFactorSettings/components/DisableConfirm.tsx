"use client"

import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import type { useTwoFactorSetup } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/TwoFactorSettings/hooks/useTwoFactorSetup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type SetupState = ReturnType<typeof useTwoFactorSetup>

interface DisableConfirmProps {
  state: SetupState
}

export function DisableConfirm({ state }: DisableConfirmProps) {
  const t = useTranslations("dashboard.settings.twoFactor.disableConfirm")

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label
          htmlFor="2fa-disable-password"
          className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
        >
          {t("passwordLabel")}
        </Label>
        <Input
          id="2fa-disable-password"
          type="password"
          value={state.password}
          onChange={(e) => state.setPassword(e.target.value)}
          placeholder={t("passwordPlaceholder")}
          className="rounded-none"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              state.confirmDisable()
            }
          }}
        />
      </div>

      {state.error && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="destructive"
          className="rounded-none h-11"
          disabled={state.isLoading}
          onClick={state.confirmDisable}
        >
          {state.isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t("confirm")
          )}
        </Button>
        <Button
          type="button"
          variant="editorial-outline"
          onClick={state.cancel}
        >
          {t("cancel")}
        </Button>
      </div>
    </div>
  )
}
