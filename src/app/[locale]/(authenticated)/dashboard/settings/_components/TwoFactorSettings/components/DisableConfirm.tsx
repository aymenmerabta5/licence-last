"use client"

import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import type { useTwoFactorSetup } from "../hooks/useTwoFactorSetup"

type SetupState = ReturnType<typeof useTwoFactorSetup>

interface DisableConfirmProps {
  state: SetupState
}

export function DisableConfirm({ state }: DisableConfirmProps) {
  const t = useTranslations("dashboard.settings.twoFactor.disableConfirm")

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h4 className="font-bold text-destructive">{t("title")}</h4>
        <p className="text-xs text-muted-foreground">{t("description")}</p>
      </div>

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
          className="h-11 border-border/40"
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
          variant="editorial"
          className="bg-destructive hover:bg-destructive/90 text-white rounded-xl h-11"
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
          className="rounded-xl h-11"
          onClick={state.cancel}
        >
          {t("cancel")}
        </Button>
      </div>
    </div>
  )
}
