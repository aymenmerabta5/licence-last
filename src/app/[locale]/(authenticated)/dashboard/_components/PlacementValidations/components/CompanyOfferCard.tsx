"use client"

import { Clock, Mail, MapPin, Phone, Stamp } from "lucide-react"
import * as motion from "motion/react-client"
import { useLocale, useTranslations } from "next-intl"

import { CompanyLogo } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/components/CompanyLogo"
import { InfoRow } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/components/InfoRow"
import { TimelineItem } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/components/TimelineItem"
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
    <div className={cn("border-t border-border/40 pt-4", className)}>
      {children}
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
      className="group relative overflow-hidden border border-border bg-background"
    >
      {/* Top accent band */}
      <div className="absolute top-0 start-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20" />

      {/* Subtle background watermark */}
      <div className="absolute top-4 end-4 text-[6rem] font-serif font-bold text-primary/[0.04] leading-none select-none pointer-events-none hidden sm:block">
        {application.company.name.charAt(0)}
      </div>

      <div className="relative p-6 sm:p-8 space-y-6">
        {/* Header with logo */}
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-start gap-5">
          <CompanyLogo
            logoUrl={application.company.logoUrl}
            name={application.company.name}
          />
          <div className="space-y-1 pt-1">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-heading tracking-tight">
              {application.company.name}
            </h2>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
              {t("companyInfo")}
            </p>
            {application.company.contactEmail && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 border border-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary/80">
                  <Mail className="h-3 w-3" />
                  {application.company.contactEmail}
                </span>
              </div>
            )}
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
        </div>

        {/* Offer Details */}
        <Section>
          <h3 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            <Stamp className="h-3.5 w-3.5 text-primary/60" />
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
          <h3 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-primary/60" />
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
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              {t("coverLetter")}
            </h3>
            <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
              {application.coverLetter}
            </p>
          </Section>
        )}
      </div>
    </motion.div>
  )
}
