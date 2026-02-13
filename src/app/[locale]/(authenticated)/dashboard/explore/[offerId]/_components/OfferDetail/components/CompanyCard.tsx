"use client"

import { useTranslations } from "next-intl"
import { MapPin } from "lucide-react"

import type { OfferDetailProps } from "../types"

interface CompanyCardProps {
  offer: OfferDetailProps["offer"]
  trustScore: number | undefined
  trustTier: string | undefined
}

export function CompanyCard({ offer, trustScore, trustTier }: CompanyCardProps) {
  const t = useTranslations("dashboard.offerDetail")
  const companyInitial = offer.companyName.charAt(0).toUpperCase()

  return (
    <div className="border border-border p-5 space-y-3">
      <h3 className="font-serif text-base text-heading">
        {t("aboutCompany")}
      </h3>
      {trustScore != null && (
        <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wider">
          <span className="text-muted-foreground">Trust index</span>
          <span className="font-semibold text-heading">
            {trustScore}/100
          </span>
          <span className="text-muted-foreground">({trustTier})</span>
        </div>
      )}
      <div className="flex items-center gap-3">
        {offer.companyLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={offer.companyLogoUrl}
            alt={offer.companyName}
            className="h-10 w-10 rounded border border-border object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded border border-border bg-primary/10 flex items-center justify-center text-base font-serif text-primary">
            {companyInitial}
          </div>
        )}
        <div>
          <p className="font-medium text-sm">{offer.companyName}</p>
          {offer.companyWilayaCode && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {String(offer.companyWilayaCode).padStart(2, "0")}
              {offer.companyAddress && ` - ${offer.companyAddress}`}
            </p>
          )}
        </div>
      </div>
      {offer.companyDescription && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {offer.companyDescription}
        </p>
      )}
    </div>
  )
}
