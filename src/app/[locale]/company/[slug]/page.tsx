import { notFound } from "next/navigation"
import { Suspense } from "react"
import { getTranslations } from "next-intl/server"

import { CompanyOffersSection } from "@/app/[locale]/company/[slug]/_components/CompanyOffersSection"
import { getWilayaName } from "@/lib/wilayas"
import { orpcClient } from "@/server/orpc/client"
import { getPublicCompanyBySlug } from "@/server/services/companies/get-public-by-slug"
import { getCompanyTrustIndex } from "@/server/services/companies/trust-index"
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

  const [t, companyFromRpc, trustData, offers] = await Promise.all([
    getTranslations("companyPublic"),
    orpcClient.companies.getById({ companyId: company.id }).catch(() => null),
    getCompanyTrustIndex(company.id).catch(() => null),
    listPublicOffersByCompany(company.id),
  ])
  const companyData = companyFromRpc ?? company
  const location = getWilayaName(companyData.wilayaCode)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <header className="border border-border/50 p-6 md:p-8 space-y-4">
          <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-primary [[dir=rtl]_&]:tracking-normal">
            {t("kicker")}
          </p>
          <div className="flex items-start gap-4">
            {companyData.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={companyData.logoUrl}
                alt={companyData.name}
                className="h-16 w-16 object-cover border border-border/50"
              />
            ) : (
              <div className="h-16 w-16 border border-border/50 bg-primary/10 flex items-center justify-center font-serif text-xl text-primary">
                {companyData.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="space-y-1">
              <h1 className="font-serif text-3xl leading-tight text-heading">
                {companyData.name}
              </h1>
              {location ? (
                <p className="text-sm text-muted-foreground">{location}</p>
              ) : null}
            </div>
          </div>

          {companyData.description ? (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {companyData.description}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {companyData.websiteUrl ? (
              <a
                href={companyData.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                {t("website")}
              </a>
            ) : null}
            {trustData ? (
              <p>
                {t("trustIndex")}:{" "}
                <span className="font-semibold text-foreground">
                  {trustData.trustScore}/100 ({trustData.tier})
                </span>
              </p>
            ) : null}
          </div>
        </header>

        <section className="space-y-4">
          <h2 className="font-serif text-2xl text-heading">
            {t("openOffers")}
          </h2>
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
