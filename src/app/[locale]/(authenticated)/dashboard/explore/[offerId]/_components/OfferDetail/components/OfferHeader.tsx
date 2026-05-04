"use client"

import { ArrowLeft, Bookmark, BookmarkCheck } from "lucide-react"
import * as motion from "motion/react-client"
import Image from "next/image"
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
      className="space-y-4"
    >
      {/* Top accent rule */}
      <div className="h-0.5 bg-primary" />

      {/* Back link */}
      <Link
        href={"/dashboard/explore" as "/dashboard"}
        className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t("back")}
      </Link>

      {/* Title + Company row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-[clamp(1.8rem,3.5vw,3rem)] leading-[1.1] tracking-tight text-heading">
            {offer.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3">
            <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              {t(`type.${offer.internshipType}` as "type.pfe")}
            </span>
            {offer.workMode && (
              <>
                <span className="text-muted-foreground/30">·</span>
                <span className="inline-flex items-center text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  {t(
                    `workModeLabel.${offer.workMode}` as "workModeLabel.on_site",
                  )}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Company byline */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-end">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
              {t("presentedBy")}
            </p>
            <p className="font-serif text-lg tracking-tight text-foreground">
              {offer.companyName}
            </p>
          </div>
          {offer.companyLogoUrl ? (
            <Image
              src={offer.companyLogoUrl}
              alt={offer.companyName}
              width={44}
              height={44}
              className="h-11 w-11 border border-border/40 object-cover"
            />
          ) : (
            <div className="h-11 w-11 border border-border/40 bg-primary/5 flex items-center justify-center text-base font-serif text-primary">
              {companyInitial}
            </div>
          )}
          {!saveUnavailable && (
            <Button
              type="button"
              size="editorial-icon"
              variant={isSaved ? "editorial" : "editorial-outline"}
              disabled={isSaveBusy}
              onClick={onToggleSaved}
              title={isSaved ? t("saved") : t("save")}
            >
              {isSaved ? (
                <BookmarkCheck className="h-3.5 w-3.5" />
              ) : (
                <Bookmark className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  )
}
