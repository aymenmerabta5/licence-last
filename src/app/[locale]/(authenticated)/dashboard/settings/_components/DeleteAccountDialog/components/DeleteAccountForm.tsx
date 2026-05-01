"use client"

import { AlertTriangle, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import type { useDeleteAccount } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/DeleteAccountDialog/hooks/useDeleteAccount"
import { PasswordField } from "@/components/form-fields/PasswordField"
import { ServerError } from "@/components/ServerError"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DeleteAccountFormProps {
  state: ReturnType<typeof useDeleteAccount>
}

export function DeleteAccountForm({ state }: DeleteAccountFormProps) {
  const t = useTranslations("dashboard.settings.deleteAccount")

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        state.handleDelete()
      }}
      className="space-y-5"
    >
      <div className="flex items-start gap-2.5 p-3.5 text-sm text-destructive bg-destructive/5 border border-destructive/15 rounded-lg">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
        <span>{t("warning")}</span>
      </div>

      <ServerError message={state.error} />

      <PasswordField
        id="deletePassword"
        label={t("passwordLabel")}
        placeholder={t("passwordPlaceholder")}
        value={state.password}
        onChange={state.setPassword}
        autoComplete="current-password"
      />

      <div className="space-y-2">
        <Label htmlFor="confirmDelete" className="text-sm font-medium">
          {t("confirmLabel", { phrase: t("confirmPhrase") })}
        </Label>
        <Input
          id="confirmDelete"
          value={state.confirmText}
          onChange={(e) => state.setConfirmText(e.target.value)}
          placeholder={t("confirmPhrase")}
          className="rounded-xl"
          autoComplete="off"
        />
      </div>

      <Button
        type="submit"
        disabled={
          state.isLoading || !state.isConfirmed || !state.password.trim()
        }
        variant="destructive"
        className="h-11 w-full rounded-none"
      >
        {state.isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin me-2" />
            {t("deleting")}
          </>
        ) : (
          t("confirm")
        )}
      </Button>
    </form>
  )
}
