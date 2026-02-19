"use client"

import { Plus } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease } from "@/lib/animations"

export function CompanyOffersHeader() {
  const t = useTranslations("dashboard.company.offers")

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
    >
      <div className="h-0.5 bg-primary" />
      <div className="relative overflow-hidden border border-t-0 border-border/50 p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-100">
          <div className="absolute -top-20 end-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="relative flex items-start justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary [[dir=rtl]_&]:tracking-normal">
              {t("pageTitle")}
            </span>
            <h1 className="font-serif text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.08] tracking-tight text-heading">
              {t("title")}
            </h1>
            <p className="max-w-lg text-sm font-light text-muted-foreground">
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
      </div>
    </motion.div>
  )
}
