"use client"

import { Building2, MapPin, ShieldAlert } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { ReportCompanyDialog } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/components/ReportCompanyDialog"
import type { UseCompanyReportResult } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/hooks/useCompanyReport"
import type { OfferDetailProps } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/types"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease } from "@/lib/animations"

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
    <section className="border border-border/50">
      <div className="flex items-center gap-3 border-b border-border/50 px-6 py-4">
        <Building2 className="h-4 w-4 text-primary" />
        <h2 className="font-serif text-xl text-heading">{t("aboutCompany")}</h2>
      </div>
      <div className="px-6 py-6 space-y-6">
        {/* Company info */}
        <div className="flex items-start gap-4">
          {offer.companyLogoUrl ? (
            <img
              src={offer.companyLogoUrl}
              alt={offer.companyName}
              className="h-14 w-14 border border-border/40 object-cover shrink-0"
            />
          ) : (
            <div className="h-14 w-14 border border-border/40 bg-primary/5 flex items-center justify-center text-xl font-serif text-primary shrink-0">
              {companyInitial}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-serif text-xl leading-tight text-heading">
              {offer.companyName}
            </p>
            {offer.companyWilayaCode && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1.5">
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
          <div className="space-y-3 pt-4 border-t border-border/20">
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
          <p className="text-sm text-muted-foreground leading-relaxed font-serif italic">
            &ldquo;{offer.companyDescription}&rdquo;
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            type="button"
            variant="editorial"
            size="editorial-sm"
            className="flex-1"
            nativeButton={false}
            render={<Link href={`/company/${offer.companySlug}`} />}
          >
            {t("viewCompanyProfile")}
          </Button>

          <Button
            type="button"
            variant="editorial-outline"
            size="editorial-sm"
            className="flex-none gap-2 px-3 text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
            onClick={() => report.onOpenChange(true)}
            title={t("report.trigger")}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
          </Button>
        </div>
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
    </section>
  )
}
