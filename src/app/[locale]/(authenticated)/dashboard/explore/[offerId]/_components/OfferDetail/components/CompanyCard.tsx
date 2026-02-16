"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { MapPin, Building } from "lucide-react"

import { reveal, ease } from "@/lib/animations"

import type { OfferDetailProps } from "../types"

interface CompanyCardProps {
  offer: OfferDetailProps["offer"]
  trustScore: number | undefined
  trustTier: string | undefined
}

export function CompanyCard({
  offer,
  trustScore,
  trustTier,
}: CompanyCardProps) {
  const t = useTranslations("dashboard.offerDetail")
  const companyInitial = offer.companyName.charAt(0).toUpperCase()

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.5, ease, delay: 0.25 }}
      className="border border-border p-5 space-y-4"
    >
      {/* Section header */}
      <div className="flex items-center gap-2">
        <Building className="h-3.5 w-3.5 text-muted-foreground/60" />
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
          {t("aboutCompany")}
        </span>
        <div className="h-px flex-1 bg-border/30" />
      </div>

      {/* Company info */}
      <div className="flex items-center gap-3">
        {offer.companyLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={offer.companyLogoUrl}
            alt={offer.companyName}
            className="h-12 w-12 border border-border object-cover shrink-0"
          />
        ) : (
          <div className="h-12 w-12 border border-border bg-primary/10 flex items-center justify-center text-lg font-serif text-primary shrink-0">
            {companyInitial}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-serif text-sm font-medium text-heading truncate">
            {offer.companyName}
          </p>
          {offer.companyWilayaCode && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {String(offer.companyWilayaCode).padStart(2, "0")}
                {offer.companyAddress && ` — ${offer.companyAddress}`}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Trust index */}
      {trustScore != null && (
        <div className="space-y-2 pt-3 border-t border-border/30">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
              {t("trustIndex")}
            </span>
            <span className="text-xs font-medium text-foreground tabular-nums">
              {trustScore}/100
              {trustTier && (
                <span className="text-muted-foreground ms-1">
                  ({trustTier})
                </span>
              )}
            </span>
          </div>
          <div className="h-1.5 bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${trustScore}%` }}
              transition={{ duration: 0.8, ease, delay: 0.3 }}
              className="h-full bg-primary"
            />
          </div>
        </div>
      )}

      {/* Description */}
      {offer.companyDescription && (
        <p className="text-xs text-muted-foreground leading-relaxed pt-1">
          {offer.companyDescription}
        </p>
      )}
    </motion.div>
  )
}
