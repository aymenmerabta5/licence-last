"use client"

import { MapPin, ShieldAlert } from "lucide-react"
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
      className="space-y-6 pt-8 border-t-[3px] border-border/80"
    >
      {/* Section header */}
      <div className="mb-2">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
          {t("aboutCompany")}
        </h2>
      </div>

      {/* Company info */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          {offer.companyLogoUrl ? (
            <img
              src={offer.companyLogoUrl}
              alt={offer.companyName}
              className="h-16 w-16 border border-border/40 object-cover shrink-0"
            />
          ) : (
            <div className="h-16 w-16 border border-border/40 bg-muted flex items-center justify-center text-2xl font-serif text-primary shrink-0">
              {companyInitial}
            </div>
          )}
          <div className="min-w-0 pt-1">
            <p className="font-serif text-2xl leading-none text-heading">
              {offer.companyName}
            </p>
            {offer.companyWilayaCode && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-2 font-mono uppercase tracking-widest">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  {String(offer.companyWilayaCode).padStart(2, "0")}
                  {offer.companyAddress && ` — ${offer.companyAddress}`}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Trust index */}
      {trustScore != null && (
        <div className="space-y-3 pt-4 border-t border-border/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
              {t("trustIndex")}
            </span>
            <span className="text-sm font-serif text-heading tabular-nums">
              {trustScore}/100
              {trustTier && (
                <span className="text-muted-foreground/60 ms-1 font-sans text-xs">
                  ({trustTier})
                </span>
              )}
            </span>
          </div>
          <div className="h-px w-full bg-border/40 relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${trustScore}%` }}
              transition={{ duration: 1, ease, delay: 0.3 }}
              className="absolute top-0 start-0 h-px bg-primary"
            />
          </div>
        </div>
      )}

      {/* Description */}
      {offer.companyDescription && (
        <p className="text-sm text-muted-foreground leading-relaxed pt-2 font-serif italic">
          "{offer.companyDescription}"
        </p>
      )}

      <div className="pt-4 flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          variant="editorial"
          size="sm"
          className="flex-1 rounded-none uppercase tracking-widest text-[10px]"
          nativeButton={false}
          render={<Link href={`/company/${offer.companySlug}`} />}
        >
          {t("viewCompanyProfile")}
        </Button>

        <Button
          type="button"
          variant="editorial-outline"
          size="sm"
          className="flex-none gap-2 rounded-none px-4"
          onClick={() => report.onOpenChange(true)}
          title={t("report.trigger")}
        >
          <ShieldAlert className="h-3.5 w-3.5" />
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
