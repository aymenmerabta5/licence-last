"use client"

import { Check, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import type { ProfileSettingsFormApi } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/hooks/useProfileSettings"
import { Button } from "@/components/ui/button"

interface FormActionsProps {
  form: ProfileSettingsFormApi
  isBusy: boolean
  onReset: () => void
}

export function FormActions({ form, isBusy, onReset }: FormActionsProps) {
  const t = useTranslations("dashboard.settings")

  return (
    <div className="flex flex-col gap-4 border-t border-border/40 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <p className="w-full text-center text-xs font-medium text-muted-foreground/60 sm:w-auto sm:text-start">
        {t("unsavedChanges")}
      </p>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="editorial-ghost"
          size="editorial-sm"
          onClick={onReset}
          disabled={isBusy}
          className="w-full sm:w-auto"
        >
          {t("discard")}
        </Button>
        <form.Subscribe
          selector={(state) => [state.isSubmitting] as const}
        >
          {([isSubmitting]) => (
            <Button
              type="submit"
              variant="editorial"
              size="editorial"
              disabled={isBusy || isSubmitting}
              className="w-full gap-2 sm:w-auto"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {t("saveChanges")}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </div>
  )
}
