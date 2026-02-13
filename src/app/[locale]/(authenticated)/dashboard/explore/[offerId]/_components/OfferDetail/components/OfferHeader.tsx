"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { ArrowLeft, Building2 } from "lucide-react"

import { Link } from "@/i18n/routing"
import { reveal, ease } from "@/lib/animations"

import type { OfferDetailProps } from "../types"

interface OfferHeaderProps {
  offer: OfferDetailProps["offer"]
}

export function OfferHeader({ offer }: OfferHeaderProps) {
  const t = useTranslations("dashboard.offerDetail")
  const companyInitial = offer.companyName.charAt(0).toUpperCase()

  return (
    <>
      <motion.div {...reveal} transition={{ duration: 0.4, ease }}>
        <Link
          href={"/dashboard/explore" as "/dashboard"}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </Link>
      </motion.div>

      <motion.div
        {...reveal}
        transition={{ duration: 0.5, ease, delay: 0.05 }}
        className="space-y-3"
      >
        <div className="flex items-start gap-4">
          {offer.companyLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={offer.companyLogoUrl}
              alt={offer.companyName}
              className="h-12 w-12 rounded border border-border object-cover shrink-0"
            />
          ) : (
            <div className="h-12 w-12 rounded border border-border bg-primary/10 flex items-center justify-center text-lg font-serif text-primary shrink-0">
              {companyInitial}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-serif text-2xl lg:text-3xl text-heading tracking-tight">
              {offer.title}
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Building2 className="h-3.5 w-3.5" />
              {offer.companyName}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase border border-primary/20 bg-primary/10 text-primary">
            {t(`type.${offer.internshipType}` as "type.pfe")}
          </span>
          {offer.workMode && (
            <span className="inline-flex items-center px-2.5 py-1 text-[11px] tracking-wider uppercase border border-border text-muted-foreground">
              {t(
                `workModeLabel.${offer.workMode}` as "workModeLabel.on_site",
              )}
            </span>
          )}
        </div>
      </motion.div>
    </>
  )
}
