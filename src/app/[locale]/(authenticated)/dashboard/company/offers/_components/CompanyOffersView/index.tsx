"use client"

import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { CompanyOffersEmptyState } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/CompanyOffersView/components/CompanyOffersEmptyState"
import { CompanyOffersHeader } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/CompanyOffersView/components/CompanyOffersHeader"
import { OfferCard } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/CompanyOffersView/components/OfferCard"
import { TrustBanner } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/CompanyOffersView/components/TrustBanner"
import { useCompanyOffers } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/CompanyOffersView/hooks/useCompanyOffers"

export function CompanyOffersView() {
  const t = useTranslations("dashboard.company.offers")
  const {
    offers,
    isLoading,
    trustData,
    actionLoading,
    handlePublish,
    handleClose,
    handleDelete,
  } = useCompanyOffers()
  const hasOffers = offers.length > 0

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <CompanyOffersHeader />

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && trustData && <TrustBanner data={trustData} />}
      {!isLoading && !hasOffers && <CompanyOffersEmptyState />}

      {!isLoading && hasOffers && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 [[dir=rtl]_&]:tracking-normal">
              {offers.length} offer{offers.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-3">
            {offers.map((offer, index) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                index={index}
                isActionLoading={actionLoading === offer.id}
                onPublish={() => handlePublish(offer.id)}
                onClose={() => handleClose(offer.id, t("actions.confirmClose"))}
                onDelete={() => handleDelete(offer.id, t("actions.confirmDelete"))}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
