"use client"

import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

export function CompanyOffersHeader() {
  const t = useTranslations("dashboard.company.offers")

  return (
    <header className="space-y-4">
      <div className="h-0.5 bg-primary" />
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-3">
          <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight text-heading">
            {t("title")}
          </h1>
          <p className="text-sm font-light tracking-wide text-muted-foreground max-w-lg">
            {t("subtitle")}
          </p>
        </div>
        <Link href={"/dashboard/company/offers/new" as "/dashboard"}>
          <Button
            variant="editorial"
            size="editorial"
            className="shrink-0 gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("createOffer")}
          </Button>
        </Link>
      </div>
    </header>
  )
}
