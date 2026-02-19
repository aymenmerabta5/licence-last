"use client"

import { Building, MapPin, ShieldAlert } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { ReportCompanyDialog } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/components/ReportCompanyDialog"
import type { UseCompanyReportResult } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/hooks/useCompanyReport"
import type { OfferDetailProps } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/types"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"

interface CompanyCardProps {
  offer: OfferDetailProps["offer"]
  trustScore: number | undefined
  trustTier: string | undefined
  report: UseCompanyReportResult
}

export function CompanyCard({
  offer,
  trustScore,
  trustTier,
  report,
}: CompanyCardProps) {
  const t = useTranslations("dashboard.offerDetail")
  const companyInitial = offer.companyName.charAt(0).toUpperCase()

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.5, ease, delay: 0.25 }}
      className="border border-border p-5 space-y-4"
    >
      {/* Section header */}
      <div className="flex items-center gap-2">
        <Building className="h-3.5 w-3.5 text-muted-foreground/60" />
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
          {t("aboutCompany")}
        </span>
        <div className="h-px flex-1 bg-border/30" />
      </div>

      {/* Company info */}
      <div className="flex items-center gap-3">
        {offer.companyLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={offer.companyLogoUrl}
            alt={offer.companyName}
            className="h-12 w-12 border border-border object-cover shrink-0"
          />
        ) : (
          <div className="h-12 w-12 border border-border bg-primary/10 flex items-center justify-center text-lg font-serif text-primary shrink-0">
            {companyInitial}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-serif text-sm font-medium text-heading truncate">
            {offer.companyName}
          </p>
          {offer.companyWilayaCode && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {String(offer.companyWilayaCode).padStart(2, "0")}
                {offer.companyAddress && ` — ${offer.companyAddress}`}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Trust index */}
      {trustScore != null && (
        <div className="space-y-2 pt-3 border-t border-border/30">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
              {t("trustIndex")}
            </span>
            <span className="text-xs font-medium text-foreground tabular-nums">
              {trustScore}/100
              {trustTier && (
                <span className="text-muted-foreground ms-1">
                  ({trustTier})
                </span>
              )}
            </span>
          </div>
          <div className="h-1.5 bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${trustScore}%` }}
              transition={{ duration: 0.8, ease, delay: 0.3 }}
              className="h-full bg-primary"
            />
          </div>
        </div>
      )}

      {/* Description */}
      {offer.companyDescription && (
        <p className="text-xs text-muted-foreground leading-relaxed pt-1">
          {offer.companyDescription}
        </p>
      )}

      <div className="pt-2 border-t border-border/30 space-y-2">
        <Button
          type="button"
          variant="editorial-outline"
          size="sm"
          className="w-full"
          nativeButton={false}
          render={<Link href={`/company/${offer.companySlug}`} />}
        >
          {t("viewCompanyProfile")}
        </Button>

        <Button
          type="button"
          variant="editorial-outline"
          size="sm"
          className="w-full gap-1.5"
          onClick={() => report.onOpenChange(true)}
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          {t("report.trigger")}
        </Button>
      </div>

      <ReportCompanyDialog
        companyName={offer.companyName}
        open={report.isOpen}
        onOpenChange={report.onOpenChange}
        values={report.values}
        errors={report.errors}
        isSubmitting={report.isSubmitting}
        onFieldChange={report.setFieldValue}
        onSubmit={report.submitReport}
      />
    </motion.div>
  )
}
