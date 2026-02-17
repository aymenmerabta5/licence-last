"use client"

import * as motion from "motion/react-client"
import { useLocale, useTranslations } from "next-intl"
import { Building2, Clock, MapPin, Phone, Mail } from "lucide-react"

import { reveal, ease } from "@/lib/animations"

import { formatDate } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/utils"
import { InfoRow } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/components/InfoRow"

interface CompanyOfferCardProps {
  application: {
    createdAt: Date | string
    companyActionAt: Date | string | null
    coverLetter: string | null
    company: {
      name: string
      address?: string | null
      phone?: string | null
      representativeName?: string | null
      contactEmail?: string | null
    }
    offer: {
      title: string
      internshipType: string
      workMode?: string | null
      durationWeeks?: number | null
    }
  }
}

export function CompanyOfferCard({ application }: CompanyOfferCardProps) {
  const t = useTranslations("dashboard.admin.validations.detail")
  const locale = useLocale()

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.5, ease, delay: 0.15 }}
      className="border border-border p-6 space-y-4"
    >
      <h2 className="font-serif text-lg text-heading flex items-center gap-2">
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

      {/* Offer Details */}
      <div className="pt-4 border-t border-border space-y-3">
        <h3 className="font-medium text-xs uppercase tracking-wider text-muted-foreground">
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
        </div>
      </div>

      {/* Timeline */}
      <div className="pt-4 border-t border-border space-y-3">
        <h3 className="font-medium text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
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
            {formatDate(
              application.companyActionAt,
              locale,
              t("notAvailable"),
            )}
          </p>
        </div>
      </div>

      {/* Cover Letter */}
      {application.coverLetter && (
        <div className="pt-4 border-t border-border">
          <h3 className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-2">
            {t("coverLetter")}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-4">
            {application.coverLetter}
          </p>
        </div>
      )}
    </motion.div>
  )
}
