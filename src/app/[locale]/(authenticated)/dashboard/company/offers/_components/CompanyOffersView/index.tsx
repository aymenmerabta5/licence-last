"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { Plus, Briefcase, Loader2 } from "lucide-react"

import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { ease } from "@/lib/animations"

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
      {/* Editorial header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
      >
        <div className="h-0.5 bg-primary" />
        <div className="border border-t-0 border-border/50 p-6 sm:p-8 relative overflow-hidden">
          {/* Dark mode glow */}
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
              <p className="text-sm text-muted-foreground font-light max-w-lg">
                {t("subtitle")}
              </p>
            </div>
            <Link href={"/dashboard/company/offers/new" as "/dashboard"}>
              <Button variant="editorial" size="editorial" className="gap-2 shrink-0">
                <Plus className="h-4 w-4" />
                {t("createOffer")}
              </Button>
            </Link>
          </div>
        </div>
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
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
          className="border border-dashed border-border/40 p-12 text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/5">
            <Briefcase className="h-8 w-8 text-primary/30" />
          </div>
          <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto">
            {t("empty")}
          </p>
          <Link href={"/dashboard/company/offers/new" as "/dashboard"}>
            <Button variant="editorial-outline" size="editorial-sm" className="gap-2 mt-2">
              <Plus className="h-3.5 w-3.5" />
              {t("createOffer")}
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Offers count kicker */}
      {!isLoading && offers.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 [[dir=rtl]_&]:tracking-normal">
            {offers.length} offer{offers.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Offers List */}
      {!isLoading && offers.length > 0 && (
        <div className="space-y-3">
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
