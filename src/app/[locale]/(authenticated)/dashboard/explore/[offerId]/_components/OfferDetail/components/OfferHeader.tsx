"use client"

import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Building2,
} from "lucide-react"
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
      className="relative"
    >
      {/* Accent rule */}
      <div className="h-0.5 bg-primary mb-6" />

      {/* Back link */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <Link
          href={"/dashboard/explore" as "/dashboard"}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("back")}
        </Link>

        {!saveUnavailable && (
          <Button
            type="button"
            size="sm"
            variant="editorial-outline"
            className="gap-1.5"
            disabled={isSaveBusy}
            onClick={onToggleSaved}
          >
            {isSaved ? (
              <BookmarkCheck className="h-3.5 w-3.5" />
            ) : (
              <Bookmark className="h-3.5 w-3.5" />
            )}
            {isSaved ? "Saved" : "Save"}
          </Button>
        )}
      </div>

      {/* Masthead */}
      <div className="border border-border bg-card p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle dark-mode glow */}
        <div className="absolute -top-24 -end-24 h-48 w-48 rounded-full bg-primary/5 blur-3xl pointer-events-none dark:bg-primary/10" />

        {/* Kicker */}
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-3.5 w-3.5 text-primary" />
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary">
            {t("internshipOffer")}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.08] text-heading tracking-tight mb-4">
          {offer.title}
        </h1>

        {/* Company + badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            {offer.companyLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={offer.companyLogoUrl}
                alt={offer.companyName}
                className="h-8 w-8 border border-border object-cover shrink-0"
              />
            ) : (
              <div className="h-8 w-8 border border-border bg-primary/10 flex items-center justify-center text-sm font-serif text-primary shrink-0">
                {companyInitial}
              </div>
            )}
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {offer.companyName}
            </span>
          </div>

          <div className="h-4 w-px bg-border/50 hidden sm:block" />

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-primary/20 bg-primary/10 text-primary">
              {t(`type.${offer.internshipType}` as "type.pfe")}
            </span>
            {offer.workMode && (
              <span className="inline-flex items-center px-2.5 py-1 text-[10px] uppercase tracking-wider border border-border text-muted-foreground">
                {t(
                  `workModeLabel.${offer.workMode}` as "workModeLabel.on_site",
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
