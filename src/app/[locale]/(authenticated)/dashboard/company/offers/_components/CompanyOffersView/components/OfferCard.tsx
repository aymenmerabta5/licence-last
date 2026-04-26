"use client"

import { Clock, Languages, MapPin, Users } from "lucide-react"
import * as motion from "motion/react-client"
import { useLocale, useTranslations } from "next-intl"
import { OfferCardActions } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/CompanyOffersView/components/OfferCardActions"
import { OfferCardCandidatesLink } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/CompanyOffersView/components/OfferCardCandidatesLink"
import type { OfferItem } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/CompanyOffersView/types"
import { Badge } from "@/components/ui/badge"
import { ease } from "@/lib/animations"
import { getLanguageLabel, toSupportedLocale } from "@/lib/constants/languages"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<
  string,
  { accent: string; bg: string; badge: string }
> = {
  draft: {
    accent: "border-s-amber-500",
    bg: "hover:bg-amber-500/[0.02]",
    badge:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  published: {
    accent: "border-s-emerald-500",
    bg: "hover:bg-emerald-500/[0.02]",
    badge:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  closed: {
    accent: "border-s-zinc-400",
    bg: "hover:bg-zinc-400/[0.02]",
    badge: "bg-zinc-400/10 text-zinc-500 border-zinc-400/20",
  },
}

interface OfferCardProps {
  offer: OfferItem
  index: number
  canManageStatus: boolean
  isActionLoading: boolean
  onPublish: () => void
  onClose: () => void
  onDelete: () => void
}

export function OfferCard({
  offer,
  index,
  canManageStatus,
  isActionLoading,
  onPublish,
  onClose,
  onDelete,
}: OfferCardProps) {
  const locale = useLocale()
  const t = useTranslations("dashboard.company.offers")
  const tProficiency = useTranslations(
    "dashboard.company.offers.form.proficiencyLevels",
  )
  const config = STATUS_CONFIG[offer.status] ?? STATUS_CONFIG.draft
  const languageLocale = toSupportedLocale(locale)

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease, delay: 0.05 * index }}
      className={cn(
        "group border border-border/50 border-s-4 p-5 sm:p-6 transition-all",
        config.accent,
        config.bg,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="font-serif text-lg leading-tight tracking-tight text-heading">
              {offer.title}
            </h3>
            <Badge
              variant="outline"
              className={cn(
                "h-5 shrink-0 px-2 py-0 text-[8px] font-bold uppercase tracking-widest",
                config.badge,
              )}
            >
              {t(`status.${offer.status}` as "status.draft")}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
              {t(`type.${offer.internshipType}` as "type.pfe")}
            </span>
            {offer.workMode && (
              <>
                <span className="text-muted-foreground/20">/</span>
                <span className="text-[10px] font-medium text-muted-foreground/50">
                  {t(`workMode.${offer.workMode}` as "workMode.on_site")}
                </span>
              </>
            )}
          </div>
        </div>
        <OfferCardActions
          offerId={offer.id}
          status={offer.status}
          canManageStatus={canManageStatus}
          isActionLoading={isActionLoading}
          onPublish={onPublish}
          onClose={onClose}
          onDelete={onDelete}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground/60">
        {offer.wilayaCode && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-primary/40" />
            {String(offer.wilayaCode).padStart(2, "0")}
          </span>
        )}
        {offer.durationWeeks && (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-primary/40" />
            {offer.durationWeeks} {t("weeks")}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3 w-3 text-primary/40" />
          {offer.maxPositions} {t("positions")}
        </span>
      </div>

      {offer.skills.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {offer.skills.map((skill) => (
            <Badge
              key={skill.id}
              variant="secondary"
              className="rounded-full bg-primary/5 px-2.5 py-0.5 text-[10px] font-medium text-primary/80"
            >
              {skill.name}
            </Badge>
          ))}
        </div>
      )}

      {offer.languageRequirements.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {offer.languageRequirements.map((requirement) => (
            <Badge
              key={requirement.languageCode}
              variant="outline"
              className="rounded-full px-2.5 py-0.5 text-[10px] font-medium"
            >
              <Languages className="me-1 h-3 w-3" />
              {getLanguageLabel(requirement.languageCode, languageLocale)} ·{" "}
              {tProficiency(requirement.minimumProficiency as "a1")}
            </Badge>
          ))}
        </div>
      )}

      {offer.status !== "draft" && (
        <div className="border-t border-border/30 pt-3">
          <OfferCardCandidatesLink
            offerId={offer.id}
            candidatesCount={offer.candidatesCount}
          />
        </div>
      )}
    </motion.div>
  )
}
