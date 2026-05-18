"use client"

import { Clock, Mail, MapPin, Phone, Stamp } from "lucide-react"
import * as motion from "motion/react-client"
import { useLocale, useTranslations } from "next-intl"

import { CompanyLogo } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/components/CompanyLogo"
import { InfoRow } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/components/InfoRow"
import { TimelineItem } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/components/TimelineItem"
import type { ValidationDetailData } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/types"
import { formatDate } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/utils"
import { Separator } from "@/components/ui/separator"
import { ease, reveal } from "@/lib/animations"
import { cn } from "@/lib/utils"

interface CompanyOfferCardProps {
  application: ValidationDetailData
}

function Section({
  children,
  className,
  title,
  titleIcon,
}: {
  children: React.ReactNode
  className?: string
  title?: string
  titleIcon?: React.ReactNode
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {title && (
        <div className="flex items-center gap-2">
          {titleIcon && (
            <span className="text-muted-foreground/70">{titleIcon}</span>
          )}
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {title}
          </h3>
        </div>
      )}
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
        )} \u2014 ${formatDate(
          application.offer.expectedEndDate,
          locale,
          t("notAvailable"),
        )}`
      : t("notAvailable")

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.5, ease, delay: 0.15 }}
      className="relative overflow-hidden border border-border/60 bg-background"
    >
      <div className="relative p-6 sm:p-8 space-y-8">
        {/* Header with logo */}
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-start gap-5">
          <CompanyLogo
            logoUrl={application.company.logoUrl}
            name={application.company.name}
          />
          <div className="space-y-2 pt-0.5">
            <div className="space-y-1">
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-heading tracking-tight">
                {application.company.name}
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {t("companyInfo")}
              </p>
            </div>
            {application.company.contactEmail && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3 text-primary/60" />
                  {application.company.contactEmail}
                </span>
              </div>
            )}
          </div>
        </div>

        <Separator className="bg-border/40" />

        {/* Contact */}
        <Section title={t("companyInfo")}>
          <div className="grid gap-y-2 gap-x-6 sm:grid-cols-2">
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
        </Section>

        <Separator className="bg-border/40" />

        {/* Offer Details */}
        <Section
          title={t("offerDetails")}
          titleIcon={<Stamp className="h-3.5 w-3.5 text-primary/60" />}
        >
          <div className="grid gap-y-2 gap-x-6 sm:grid-cols-2">
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

        <Separator className="bg-border/40" />

        {/* Timeline */}
        <Section
          title={t("timeline")}
          titleIcon={<Clock className="h-3.5 w-3.5 text-primary/60" />}
        >
          <div className="border-s-2 border-border/40 ps-5 space-y-1">
            <TimelineItem
              label={t("appliedOn")}
              date={application.createdAt}
            />
            <TimelineItem
              label={t("companyAcceptedOn")}
              date={application.companyActionAt}
            />
          </div>
        </Section>

        {application.coverLetter && (
          <>
            <Separator className="bg-border/40" />
            <Section title={t("coverLetter")}>
              <div className="rounded-lg bg-muted/30 border border-border/30 p-4">
                <p className="text-sm leading-[1.7] text-muted-foreground">
                  {application.coverLetter}
                </p>
              </div>
            </Section>
          </>
        )}
      </div>
    </motion.div>
  )
}
