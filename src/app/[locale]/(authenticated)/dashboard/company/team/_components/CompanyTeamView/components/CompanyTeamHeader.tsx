"use client"

import { useTranslations } from "next-intl"

export function CompanyTeamHeader() {
  const t = useTranslations("dashboard.company.team")

  return (
    <header className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
        {t("kicker")}
      </p>
      <h1 className="font-serif text-3xl tracking-tight text-heading">
        {t("title")}
      </h1>
      <p className="text-sm text-muted-foreground">
        {t("subtitle")}
      </p>
    </header>
  )
}
