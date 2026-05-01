"use client"

import { Briefcase, Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

export function CompanyOffersEmptyState() {
  const t = useTranslations("dashboard.company.offers")

  return (
    <div className="border border-dashed border-border/60 p-12 text-center space-y-4">
      <div className="mx-auto flex h-14 w-14 items-center justify-center border border-border/50 bg-muted/30">
        <Briefcase className="h-6 w-6 text-muted-foreground/40" />
      </div>
      <div className="space-y-2">
        <p className="font-serif text-lg text-heading">
          {t("empty")}
        </p>
      </div>
      <Link href={"/dashboard/company/offers/new" as "/dashboard"}>
        <Button
          variant="editorial-outline"
          size="editorial-sm"
          className="mt-2 gap-2"
        >
          <Plus className="h-3.5 w-3.5" />
          {t("createOffer")}
        </Button>
      </Link>
    </div>
  )
}
