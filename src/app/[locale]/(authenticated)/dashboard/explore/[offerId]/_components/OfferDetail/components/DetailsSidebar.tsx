"use client"

import * as motion from "motion/react-client"
import { useLocale, useTranslations } from "next-intl"
import {
  Briefcase,
  Monitor,
  MapPin,
  Clock,
  Users,
  Calendar,
  Info,
} from "lucide-react"

import { reveal, ease } from "@/lib/animations"

import type { OfferDetailProps } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/types"

interface DetailsSidebarProps {
  offer: OfferDetailProps["offer"]
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className="h-4 w-4 text-primary/70 shrink-0" />
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-xs font-medium text-foreground ms-auto">{value}</dd>
    </div>
  )
}

export function DetailsSidebar({ offer }: DetailsSidebarProps) {
  const t = useTranslations("dashboard.offerDetail")
  const locale = useLocale()

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.5, ease, delay: 0.15 }}
      className="border border-border bg-muted/30 p-5 space-y-4"
    >
      {/* Section divider header */}
      <div className="flex items-center gap-2">
        <Info className="h-3.5 w-3.5 text-muted-foreground/60" />
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
          {t("details")}
        </span>
        <div className="h-px flex-1 bg-border/30" />
      </div>

      <dl className="divide-y divide-border/30">
        <DetailRow
          icon={Briefcase}
          label={t("internshipType")}
          value={t(`type.${offer.internshipType}` as "type.pfe")}
        />

        {offer.workMode && (
          <DetailRow
            icon={Monitor}
            label={t("workMode")}
            value={t(
              `workModeLabel.${offer.workMode}` as "workModeLabel.on_site",
            )}
          />
        )}

        {offer.wilayaCode && (
          <DetailRow
            icon={MapPin}
            label={t("location")}
            value={String(offer.wilayaCode).padStart(2, "0")}
          />
        )}

        {offer.durationWeeks && (
          <DetailRow
            icon={Clock}
            label={t("duration")}
            value={`${offer.durationWeeks} ${t("weeks")}`}
          />
        )}

        <DetailRow
          icon={Users}
          label={t("positions")}
          value={offer.maxPositions}
        />

        <DetailRow
          icon={Calendar}
          label={t("deadline")}
          value={
            offer.applicationDeadlineAt
              ? new Date(offer.applicationDeadlineAt).toLocaleDateString(locale)
              : t("noDeadline")
          }
        />

        {(offer.expectedStartDate || offer.expectedEndDate) && (
          <DetailRow
            icon={Calendar}
            label={t("expectedPeriod")}
            value={
              offer.expectedStartDate && offer.expectedEndDate
                ? `${new Date(offer.expectedStartDate).toLocaleDateString(locale)} - ${new Date(offer.expectedEndDate).toLocaleDateString(locale)}`
                : t("notSpecified")
            }
          />
        )}
      </dl>
    </motion.div>
  )
}
