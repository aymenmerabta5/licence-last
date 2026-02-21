"use client"

import {
  Briefcase,
  Calendar,
  Clock,
  MapPin,
  Monitor,
  Users,
} from "lucide-react"
import * as motion from "motion/react-client"
import { useLocale, useTranslations } from "next-intl"
import type { OfferDetailProps } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/types"
import { ease, reveal } from "@/lib/animations"

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
      className="space-y-6"
    >
      {/* Section divider header style */}
      <div className="border-b border-border/80 pb-2 mb-4">
        <h2 className="font-serif text-xl text-heading tracking-tight">
          {t("details")}
        </h2>
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
