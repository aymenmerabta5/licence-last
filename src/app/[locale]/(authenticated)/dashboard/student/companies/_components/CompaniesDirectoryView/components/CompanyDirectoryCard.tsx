import { ArrowUpRight, BriefcaseBusiness, Globe, MapPin } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"

import type { CompanyDirectoryItem } from "@/app/[locale]/(authenticated)/dashboard/student/companies/_components/CompaniesDirectoryView/types"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/i18n/routing"
import { getWilayaName } from "@/lib/wilayas"

interface CompanyDirectoryCardProps {
  company: CompanyDirectoryItem
}

export function CompanyDirectoryCard({ company }: CompanyDirectoryCardProps) {
  const t = useTranslations("dashboard.studentCompanies")
  const initial = company.name.charAt(0).toUpperCase()
  const wilayaName = getWilayaName(company.wilayaCode)

  return (
    <Link href={`/company/${company.slug}`} className="block group">
      <article className="relative border border-border/60 h-full transition-all duration-300 hover:border-primary/30 hover:shadow-md dark:hover:shadow-primary/5 overflow-hidden">
        {/* Top accent line */}
        <div className="h-0.5 bg-primary" />

        <div className="p-5 space-y-4">
          {/* Header row */}
          <div className="flex items-start gap-3">
            {company.logoUrl ? (
              <Image
                src={company.logoUrl}
                alt={company.name}
                width={44}
                height={44}
                className="h-11 w-11 border border-border/60 object-cover shrink-0"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-border/60 bg-primary/5 font-serif text-base text-primary">
                {initial}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h3 className="font-serif text-base leading-tight text-heading tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
                {company.name}
              </h3>
              <Badge
                variant="outline"
                className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.12em]"
              >
                <BriefcaseBusiness className="h-3 w-3 me-1" />
                {t("openOffersCount", { count: company.openOffersCount })}
              </Badge>
            </div>
          </div>

          {/* Description */}
          {company.description && (
            <p className="text-xs text-muted-foreground/60 font-light leading-relaxed line-clamp-3">
              {company.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground/50 pt-2 border-t border-border/20">
            {wilayaName && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {wilayaName}
              </span>
            )}
            {company.websiteUrl && (
              <span className="inline-flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {t("websiteAvailable")}
              </span>
            )}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.15em] text-primary opacity-0 group-hover:opacity-100 transition-opacity [[dir=rtl]_&]:tracking-normal">
            {t("viewProfile")}
            <ArrowUpRight className="h-3 w-3" />
          </div>
        </div>
      </article>
    </Link>
  )
}
