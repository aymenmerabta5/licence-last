"use client"

import { ArrowLeft, Bookmark, BookmarkCheck, Briefcase } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import type { OfferDetailProps } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/types"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"

interface OfferHeaderProps {
  offer: OfferDetailProps["offer"]
  isSaved: boolean
  isSaveBusy: boolean
  saveUnavailable: boolean
  onToggleSaved: () => void
}

export function OfferHeader({
  offer,
  isSaved,
  isSaveBusy,
  saveUnavailable,
  onToggleSaved,
}: OfferHeaderProps) {
  const t = useTranslations("dashboard.offerDetail")
  const companyInitial = offer.companyName.charAt(0).toUpperCase()

  return (
    <motion.header
      {...reveal}
      transition={{ duration: 0.6, ease }}
      className="relative pt-4"
    >
      {/* Back link & actions */}
      <div className="flex items-center justify-between gap-3 mb-10 pb-6 border-b border-border/40">
        <Link
          href={"/dashboard/explore" as "/dashboard"}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("back")}
        </Link>

        {!saveUnavailable && (
          <Button
            type="button"
            size="sm"
            variant="editorial-outline"
            className="gap-1.5 h-8 px-3 rounded-none text-[11px] uppercase tracking-wider"
            disabled={isSaveBusy}
            onClick={onToggleSaved}
          >
            {isSaved ? (
              <BookmarkCheck className="h-3.5 w-3.5" />
            ) : (
              <Bookmark className="h-3.5 w-3.5" />
            )}
            {isSaved ? t("saved") : t("save")}
          </Button>
        )}
      </div>

      {/* Masthead */}
      <div className="relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-6">
          <div className="flex-1 max-w-4xl">
            {/* Kicker */}
            <div className="flex items-center gap-2 mb-5">
              <Briefcase className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                {t("internshipOffer")}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] text-heading tracking-tight">
              {offer.title}
            </h1>
          </div>

          {/* Company Byline Style */}
          <div className="flex flex-col items-start md:items-end md:text-end shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 mb-2">
              Presented By
            </span>
            <div className="flex items-center gap-3">
              <span className="font-serif text-xl tracking-tight text-foreground">
                {offer.companyName}
              </span>
              {offer.companyLogoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={offer.companyLogoUrl}
                  alt={offer.companyName}
                  className="h-10 w-10 border border-border/40 object-cover"
                />
              ) : (
                <div className="h-10 w-10 border border-border/40 bg-muted flex items-center justify-center text-lg font-serif text-primary">
                  {companyInitial}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Badges strip below title */}
        <div className="flex flex-wrap items-center gap-4 pt-6">
          <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
            {t(`type.${offer.internshipType}` as "type.pfe")}
          </span>
          {offer.workMode && (
            <>
              <span className="text-muted-foreground/30">•</span>
              <span className="inline-flex items-center text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {t(
                  `workModeLabel.${offer.workMode}` as "workModeLabel.on_site",
                )}
              </span>
            </>
          )}
        </div>
      </div>
    </motion.header>
  )
}
