"use client"

import { AlertCircle, RotateCcw } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

export default function CandidatesDashboardError({
  error: _error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  const t = useTranslations("dashboard")

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="size-8 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="font-serif text-xl font-semibold">
          {t("error.title", { defaultMessage: "Something went wrong" })}
        </h2>
        <p className="text-muted-foreground text-sm max-w-md">
          {t("error.description", {
            defaultMessage: "An unexpected error occurred. Please try again.",
          })}
        </p>
      </div>
      <Button variant="outline" onClick={reset}>
        <RotateCcw className="size-4" />
        {t("error.retry", { defaultMessage: "Try again" })}
      </Button>
    </div>
  )
}
