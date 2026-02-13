"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { Plus, Briefcase, Loader2 } from "lucide-react"

import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { reveal, ease } from "@/lib/animations"

import { useCompanyOffers } from "./hooks/useCompanyOffers"
import { OfferCard } from "./components/OfferCard"
import { TrustBanner } from "./components/TrustBanner"

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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="flex items-start justify-between"
      >
        <div className="space-y-1">
          <h1 className="font-serif text-3xl text-heading tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground font-light">
            {t("subtitle")}
          </p>
        </div>
        <Link href={"/dashboard/company/offers/new" as "/dashboard"}>
          <Button variant="editorial" size="editorial" className="gap-2">
            <Plus className="h-4 w-4" />
            {t("createOffer")}
          </Button>
        </Link>
      </motion.div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Trust Index */}
      {!isLoading && trustData && <TrustBanner data={trustData} />}

      {/* Empty State */}
      {!isLoading && offers.length === 0 && (
        <motion.div
          {...reveal}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
          className="border border-dashed border-border p-12 text-center"
        >
          <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        </motion.div>
      )}

      {/* Offers List */}
      {!isLoading && offers.length > 0 && (
        <div className="space-y-4">
          {offers.map((offer, i) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              index={i}
              isActionLoading={actionLoading === offer.id}
              onPublish={() => handlePublish(offer.id)}
              onClose={() => handleClose(offer.id, t("actions.confirmClose"))}
              onDelete={() => handleDelete(offer.id, t("actions.confirmDelete"))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
