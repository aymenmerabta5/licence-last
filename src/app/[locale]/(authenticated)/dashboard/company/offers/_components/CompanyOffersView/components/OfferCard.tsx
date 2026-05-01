"use client"

import { Briefcase, Clock, Languages, MapPin, Users } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { OfferCardActions } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/CompanyOffersView/components/OfferCardActions"
import { OfferCardCandidatesLink } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/CompanyOffersView/components/OfferCardCandidatesLink"
import type { OfferItem } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/CompanyOffersView/types"
import { Badge } from "@/components/ui/badge"
import { getLanguageLabel, toSupportedLocale } from "@/lib/constants/languages"

interface OfferCardProps {
  offer: OfferItem
  canManageStatus: boolean
  isActionLoading: boolean
  onPublish: () => void
  onClose: () => void
  onDelete: () => void
}

export function OfferCard({
  offer,
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
  const languageLocale = toSupportedLocale(locale)

  return (
    <article className="border border-border/60 bg-card/30 dark:bg-card/50 p-5 transition-colors hover:border-primary/40 hover:bg-primary/[0.02] dark:hover:bg-primary/[0.04]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          {/* Title row */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-border/50 bg-muted/30 transition-colors">
              <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <h3 className="truncate font-serif text-base text-heading">
              {offer.title}
            </h3>
          </div>

          {/* Meta row: status · type · workMode · candidates */}
          <div className="flex flex-wrap items-center gap-2 ps-[42px]">
            <Badge variant="editorial" className="text-[9px]">
              {t(`status.${offer.status}` as "status.draft")}
            </Badge>

            <span className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              {t(`type.${offer.internshipType}` as "type.pfe")}
            </span>

            {offer.workMode && (
              <>
                <span className="text-muted-foreground/30">|</span>
                <span className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  {t(`workMode.${offer.workMode}` as "workMode.on_site")}
                </span>
              </>
            )}

            <span className="text-muted-foreground/30">|</span>

            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              <Users className="h-3 w-3" />
              {offer.candidatesCount}{" "}
              {t("candidates", { count: offer.candidatesCount })}
            </span>
          </div>

          {/* Details row: location · duration · positions */}
          <div className="flex flex-wrap items-center gap-3 ps-[42px] text-[10px] uppercase tracking-[0.08em] text-muted-foreground/70">
            {offer.wilayaCode && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {String(offer.wilayaCode).padStart(2, "0")}
              </span>
            )}
            {offer.durationWeeks && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {offer.durationWeeks} {t("weeks")}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              {offer.maxPositions} {t("positions")}
            </span>
          </div>

          {/* Skills */}
          {offer.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 ps-[42px]">
              {offer.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="inline-flex items-center border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary/80"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          )}

          {/* Languages */}
          {offer.languageRequirements.length > 0 && (
            <div className="flex flex-wrap gap-1.5 ps-[42px]">
              {offer.languageRequirements.map((requirement) => (
                <span
                  key={requirement.languageCode}
                  className="inline-flex items-center gap-1 border border-border/60 bg-muted/20 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                >
                  <Languages className="h-3 w-3" />
                  {getLanguageLabel(requirement.languageCode, languageLocale)} ·{" "}
                  {tProficiency(requirement.minimumProficiency as "a1")}
                </span>
              ))}
            </div>
          )}

          {/* Candidates link */}
          {offer.status !== "draft" && (
            <div className="border-t border-border/30 pt-3 ps-[42px]">
              <OfferCardCandidatesLink
                offerId={offer.id}
                candidatesCount={offer.candidatesCount}
              />
            </div>
          )}
        </div>

        {/* Actions */}
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
    </article>
  )
}
