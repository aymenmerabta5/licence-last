"use client"

import { useLocale, useTranslations } from "next-intl"
import {
  Briefcase,
  Monitor,
  MapPin,
  Clock,
  Users,
  Calendar,
} from "lucide-react"

import type { OfferDetailProps } from "../types"

interface DetailsSidebarProps {
  offer: OfferDetailProps["offer"]
}

export function DetailsSidebar({ offer }: DetailsSidebarProps) {
  const t = useTranslations("dashboard.offerDetail")
  const locale = useLocale()

  return (
    <div className="border border-border p-5 space-y-4">
      <h3 className="font-serif text-base text-heading">{t("details")}</h3>

      <dl className="space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
          <dt className="text-muted-foreground">{t("internshipType")}:</dt>
          <dd className="font-medium ms-auto">
            {t(`type.${offer.internshipType}` as "type.pfe")}
          </dd>
        </div>

        {offer.workMode && (
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-muted-foreground shrink-0" />
            <dt className="text-muted-foreground">{t("workMode")}:</dt>
            <dd className="font-medium ms-auto">
              {t(
                `workModeLabel.${offer.workMode}` as "workModeLabel.on_site",
              )}
            </dd>
          </div>
        )}

        {offer.wilayaCode && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <dt className="text-muted-foreground">{t("location")}:</dt>
            <dd className="font-medium ms-auto">
              {String(offer.wilayaCode).padStart(2, "0")}
            </dd>
          </div>
        )}

        {offer.durationWeeks && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <dt className="text-muted-foreground">{t("duration")}:</dt>
            <dd className="font-medium ms-auto">
              {offer.durationWeeks} {t("weeks")}
            </dd>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground shrink-0" />
          <dt className="text-muted-foreground">{t("positions")}:</dt>
          <dd className="font-medium ms-auto">{offer.maxPositions}</dd>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          <dt className="text-muted-foreground">{t("deadline")}:</dt>
          <dd className="font-medium ms-auto">
            {offer.closesAt
              ? new Date(offer.closesAt).toLocaleDateString(locale)
              : t("noDeadline")}
          </dd>
        </div>
      </dl>
    </div>
  )
}
