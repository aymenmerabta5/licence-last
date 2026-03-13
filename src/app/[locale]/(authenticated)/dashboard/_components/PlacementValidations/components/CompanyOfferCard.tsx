"use client"

import { Building2, Clock, Mail, MapPin, Phone } from "lucide-react"
import * as motion from "motion/react-client"
import { useLocale, useTranslations } from "next-intl"

import { InfoRow } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/components/InfoRow"
import type { ValidationDetailData } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/types"
import { formatDate } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/utils"
import { ease, reveal } from "@/lib/animations"

interface CompanyOfferCardProps {
  application: ValidationDetailData
}

export function CompanyOfferCard({ application }: CompanyOfferCardProps) {
  const t = useTranslations("dashboard.admin.validations.detail")
  const locale = useLocale()

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.5, ease, delay: 0.15 }}
      className="space-y-4 border border-border p-6"
    >
      <h2 className="flex items-center gap-2 font-serif text-lg text-heading">
        <Building2 className="h-4 w-4" />
        {t("companyInfo")}
      </h2>
      <div className="space-y-3 text-sm">
        <InfoRow label={t("companyName")} value={application.company.name} />
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

      <div className="space-y-3 border-t border-border pt-4">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t("offerDetails")}
        </h3>
        <div className="space-y-2 text-sm">
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
          <InfoRow
            label={t("expectedPeriod")}
            value={
              application.offer.expectedStartDate &&
              application.offer.expectedEndDate
                ? `${formatDate(
                    application.offer.expectedStartDate,
                    locale,
                    t("notAvailable"),
                  )} - ${formatDate(
                    application.offer.expectedEndDate,
                    locale,
                    t("notAvailable"),
                  )}`
                : t("notAvailable")
            }
          />
        </div>
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <h3 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {t("timeline")}
        </h3>
        <div className="text-xs text-muted-foreground">
          <p>
            {t("appliedOn")}:{" "}
            {formatDate(application.createdAt, locale, t("notAvailable"))}
          </p>
          <p>
            {t("companyAcceptedOn")}:{" "}
            {formatDate(application.companyActionAt, locale, t("notAvailable"))}
          </p>
        </div>
      </div>

      {application.coverLetter && (
        <div className="border-t border-border pt-4">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("coverLetter")}
          </h3>
          <p className="line-clamp-4 text-xs text-muted-foreground">
            {application.coverLetter}
          </p>
        </div>
      )}
    </motion.div>
  )
}
