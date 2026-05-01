"use client"

import { Copy, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"
import type { useTwoFactorSetup } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/TwoFactorSettings/hooks/useTwoFactorSetup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type SetupState = ReturnType<typeof useTwoFactorSetup>

interface EnableFlowProps {
  state: SetupState
}

export function EnableFlow({ state }: EnableFlowProps) {
  const t = useTranslations("dashboard.settings.twoFactor")

  if (state.phase === "enabling") {
    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="2fa-password"
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >
            {t("enableStep.passwordLabel")}
          </Label>
          <Input
            id="2fa-password"
            type="password"
            value={state.password}
            onChange={(e) => state.setPassword(e.target.value)}
            placeholder={t("enableStep.passwordPlaceholder")}
            className="rounded-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                state.submitPassword()
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
            disabled={state.isLoading}
            onClick={state.submitPassword}
          >
            {state.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("enableStep.continue")
            )}
          </Button>
          <Button
            type="button"
            variant="editorial-outline"
            onClick={state.cancel}
          >
            {t("disableConfirm.cancel")}
          </Button>
        </div>
      </div>
    )
  }

  if (state.phase === "verifying") {
    return (
      <div className="space-y-5">
        {state.totpURI && (
          <div className="flex flex-col items-center gap-4 p-6 border border-border/40 bg-white dark:bg-background">
            <QRCodeSVG value={state.totpURI} size={180} />
          </div>
        )}

        {state.secret && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {t("enableStep.manualEntry")}
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono bg-muted/50 p-2 break-all">
                {state.secret}
              </code>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-none"
                onClick={() => {
                  navigator.clipboard.writeText(state.secret)
                  toast.success(t("enableStep.copySecret"))
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label
            htmlFor="2fa-verify-code"
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >
            {t("verifyStep.codeLabel")}
          </Label>
          <Input
            id="2fa-verify-code"
            value={state.verifyCode}
            onChange={(e) => state.setVerifyCode(e.target.value)}
            placeholder={t("verifyStep.codePlaceholder")}
            className="rounded-none text-center text-lg tracking-[0.3em] font-mono"
            maxLength={6}
            autoFocus
            autoComplete="one-time-code"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                state.verifyAndEnable()
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
            disabled={state.isLoading || !state.verifyCode.trim()}
            onClick={state.verifyAndEnable}
          >
            {state.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("verifyStep.verify")
            )}
          </Button>
          <Button
            type="button"
            variant="editorial-outline"
            onClick={state.cancel}
          >
            {t("disableConfirm.cancel")}
          </Button>
        </div>
      </div>
    )
  }

  return null
}
