"use client"

import { Building2, Clock, Mail, MapPin, Phone, Stamp } from "lucide-react"
import * as motion from "motion/react-client"
import { useLocale, useTranslations } from "next-intl"

import { InfoRow } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/components/InfoRow"
import type { ValidationDetailData } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/types"
import { formatDate } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/utils"
import { ease, reveal } from "@/lib/animations"
import { cn } from "@/lib/utils"

interface CompanyOfferCardProps {
  application: ValidationDetailData
}

function Section({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("border-t border-border/60 pt-4", className)}>
      {children}
    </div>
  )
}

function TimelineItem({
  label,
  date,
}: {
  label: string
  date: Date | string | null | undefined
}) {
  const locale = useLocale()
  const t = useTranslations("dashboard.admin.validations.detail")
  const formatted = formatDate(date ?? null, locale, t("notAvailable"))

  return (
    <div className="relative flex gap-3">
      <div className="flex flex-col items-center gap-1">
        <div className="h-2 w-2 rounded-full bg-primary/60" />
        <div className="w-px flex-1 bg-border/60" />
      </div>
      <div className="pb-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-sm text-foreground">{formatted}</p>
      </div>
    </div>
  )
}

export function CompanyOfferCard({ application }: CompanyOfferCardProps) {
  const t = useTranslations("dashboard.admin.validations.detail")
  const locale = useLocale()

  const expectedPeriod =
    application.offer.expectedStartDate && application.offer.expectedEndDate
      ? `${formatDate(
          application.offer.expectedStartDate,
          locale,
          t("notAvailable"),
        )} — ${formatDate(
          application.offer.expectedEndDate,
          locale,
          t("notAvailable"),
        )}`
      : t("notAvailable")

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.5, ease, delay: 0.15 }}
      className="space-y-5 border border-border bg-background p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-border/60 bg-primary/5 text-primary">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-serif text-lg font-semibold text-heading">
            {application.company.name}
          </h2>
          <p className="text-xs text-muted-foreground">{t("companyInfo")}</p>
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-1">
        {application.company.address && (
          <InfoRow
            label={t("address")}
            value={application.company.address}
            icon={<MapPin className="h-3.5 w-3.5" />}
          />
        )}
        {application.company.phone && (
          <InfoRow
            label={t("phone")}
            value={application.company.phone}
            icon={<Phone className="h-3.5 w-3.5" />}
          />
        )}
        {application.company.representativeName && (
          <InfoRow
            label={t("representative")}
            value={application.company.representativeName}
          />
        )}
        {application.company.contactEmail && (
          <InfoRow
            label={t("email")}
            value={application.company.contactEmail}
            icon={<Mail className="h-3.5 w-3.5" />}
          />
        )}
      </div>

      {/* Offer Details */}
      <Section>
        <h3 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Stamp className="h-3.5 w-3.5" />
          {t("offerDetails")}
        </h3>
        <div className="space-y-1">
          <InfoRow label={t("title")} value={application.offer.title} />
          <InfoRow
            label={t("type")}
            value={t(
              `internshipTypeLabel.${application.offer.internshipType}` as "internshipTypeLabel.pfe",
            )}
          />
          {application.offer.workMode && (
            <InfoRow
              label={t("workMode")}
              value={t(
                `workModeLabel.${application.offer.workMode}` as "workModeLabel.on_site",
              )}
            />
          )}
          {application.offer.durationWeeks && (
            <InfoRow
              label={t("duration")}
              value={t("durationWeeks", {
                count: application.offer.durationWeeks,
              })}
            />
          )}
          <InfoRow
            label={t("deadline")}
            value={formatDate(
              application.offer.applicationDeadlineAt ?? null,
              locale,
              t("notAvailable"),
            )}
          />
          <InfoRow label={t("expectedPeriod")} value={expectedPeriod} />
        </div>
      </Section>

      {/* Timeline */}
      <Section>
        <h3 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {t("timeline")}
        </h3>
        <TimelineItem label={t("appliedOn")} date={application.createdAt} />
        <TimelineItem
          label={t("companyAcceptedOn")}
          date={application.companyActionAt}
        />
      </Section>

      {application.coverLetter && (
        <Section>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("coverLetter")}
          </h3>
          <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
            {application.coverLetter}
          </p>
        </Section>
      )}
    </motion.div>
  )
}
