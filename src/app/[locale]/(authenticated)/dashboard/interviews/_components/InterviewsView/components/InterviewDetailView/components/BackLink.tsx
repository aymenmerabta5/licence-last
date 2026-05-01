"use client"

import { ArrowLeft } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"

export function BackLink() {
  const t = useTranslations("dashboard.interviews.detail")

  return (
    <Link
      href="/dashboard/interviews"
      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-3.5 w-3.5 rtl:scale-x-[-1]" aria-hidden="true" />
      {t("backToInterviews")}
    </Link>
  )
}
