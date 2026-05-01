"use client"

import { AlertCircle, RotateCcw } from "lucide-react"
import { useTranslations } from "next-intl"

import { ErrorShell } from "@/components/error/ErrorShell"

export default function AssistantDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations("dashboard")

  return (
    <ErrorShell
      variant="segment"
      icon={<AlertCircle className="size-12 text-primary" />}
      headline={t("error.title", { defaultMessage: "Something went wrong" })}
      description={t("error.description", {
        defaultMessage: "An unexpected error occurred. Please try again.",
      })}
      primaryAction={{
        label: t("error.retry", { defaultMessage: "Try again" }),
        icon: <RotateCcw className="h-4 w-4" />,
        onClick: reset,
      }}
      errorDigest={error.digest}
    />
  )
}
