import { BriefcaseBusiness, Globe, MapPin } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import type { CompanyDirectoryItem } from "@/app/[locale]/(authenticated)/dashboard/student/companies/_components/CompaniesDirectoryView/types"
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
      <article className="h-full border border-border/50 p-5 transition-colors duration-300 hover:border-primary/35">
        <div className="flex items-start gap-3">
          {company.logoUrl ? (
            <Image
              src={company.logoUrl}
              alt={company.name}
              width={48}
              height={48}
              className="h-12 w-12 border border-border/60 object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center border border-border/60 bg-primary/10 font-serif text-lg text-primary">
              {initial}
            </div>
          )}

          <div className="min-w-0 space-y-1">
            <h3 className="line-clamp-2 font-serif text-lg leading-tight text-heading transition-colors group-hover:text-primary">
              {company.name}
            </h3>
            <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <BriefcaseBusiness className="h-3.5 w-3.5" />
              {t("openOffersCount", { count: company.openOffersCount })}
            </p>
          </div>
        </div>

        {company.description && (
          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {company.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-3 border-t border-border/30 pt-3 text-xs text-muted-foreground">
          {wilayaName && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {wilayaName}
            </span>
          )}
          {company.websiteUrl && (
            <span className="inline-flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" />
              {t("websiteAvailable")}
            </span>
          )}
        </div>

        <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-primary [[dir=rtl]_&]:tracking-normal">
          {t("viewProfile")}
        </p>
      </article>
    </Link>
  )
}
