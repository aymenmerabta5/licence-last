import { Globe, MapPin } from "lucide-react"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { CompanyOffersSection } from "@/app/[locale]/company/[slug]/_components/CompanyOffersSection"
import { Badge } from "@/components/ui/badge"
import { getWilayaName } from "@/lib/wilayas"
import { getCompanyById } from "@/server/services/companies/get"
import { getPublicCompanyBySlug } from "@/server/services/companies/get-public-by-slug"
import { listPublicOffersByCompany } from "@/server/services/offers/list-public-by-company"

type Params = Promise<{ slug: string }>

function CompanyOffersFallback() {
  return (
    <div aria-label="Loading company offers" className="space-y-3">
      <div className="h-24 animate-pulse border border-border/50 bg-muted/10" />
      <div className="h-24 animate-pulse border border-border/50 bg-muted/10" />
    </div>
  )
}

export default async function CompanyPublicProfilePage({
  params,
}: {
  params: Params
}) {
  const { slug } = await params

  const company = await getPublicCompanyBySlug(slug)
  if (!company) {
    notFound()
  }

  const [t, companyFromService, offers] = await Promise.all([
    getTranslations("companyPublic"),
    getCompanyById(company.id).catch(() => null),
    listPublicOffersByCompany(company.id),
  ])
  const companyData = companyFromService ?? company
  const location = getWilayaName(companyData.wilayaCode)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Editorial masthead */}
        <header className="border border-border/50">
          <div className="h-0.5 bg-primary" />
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-start gap-4 md:gap-5">
              {companyData.logoUrl ? (
                <img
                  src={companyData.logoUrl}
                  alt={companyData.name}
                  className="h-16 w-16 object-cover border border-border/50 shrink-0"
                />
              ) : (
                <div className="h-16 w-16 border border-border/50 bg-primary/10 flex items-center justify-center font-serif text-xl text-primary shrink-0">
                  {companyData.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="space-y-2 min-w-0">
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold uppercase tracking-[0.18em]"
                >
                  {t("kicker")}
                </Badge>
                <h1 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] leading-[1.1] tracking-tight text-heading">
                  {companyData.name}
                </h1>
                {location ? (
                  <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {location}
                  </p>
                ) : null}
              </div>
            </div>

            {companyData.description ? (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {companyData.description}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-4 text-xs">
              {companyData.websiteUrl ? (
                <a
                  href={companyData.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {t("website")}
                </a>
              ) : null}
            </div>
          </div>
        </header>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-0.5 w-8 bg-primary" />
            <h2 className="font-serif text-2xl text-heading">
              {t("openOffers")}
            </h2>
          </div>
          <Suspense fallback={<CompanyOffersFallback />}>
            <CompanyOffersSection
              offers={offers}
              labels={{
                noOffers: t("noOffers"),
                positions: t("positions"),
              }}
            />
          </Suspense>
        </section>
      </div>
    </main>
  )
}
