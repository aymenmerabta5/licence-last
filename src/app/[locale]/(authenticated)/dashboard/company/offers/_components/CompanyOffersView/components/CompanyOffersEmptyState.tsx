"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { Briefcase, Plus } from "lucide-react"

import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { ease } from "@/lib/animations"

export function CompanyOffersEmptyState() {
  const t = useTranslations("dashboard.company.offers")

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease, delay: 0.1 }}
      className="space-y-4 border border-dashed border-border/40 p-12 text-center"
    >
      <div className="inline-flex items-center justify-center rounded-2xl bg-primary/5 p-4">
        <Briefcase className="h-8 w-8 text-primary/30" />
      </div>
      <p className="mx-auto max-w-xs text-sm text-muted-foreground/60">{t("empty")}</p>
      <Link href={"/dashboard/company/offers/new" as "/dashboard"}>
        <Button variant="editorial-outline" size="editorial-sm" className="mt-2 gap-2">
          <Plus className="h-3.5 w-3.5" />
          {t("createOffer")}
        </Button>
      </Link>
    </motion.div>
  )
}
