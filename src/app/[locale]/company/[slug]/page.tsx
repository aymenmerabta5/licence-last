import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { Link } from "@/i18n/routing"
import { requireRole } from "@/lib/auth-guards"
import { getWilayaName } from "@/lib/wilayas"
import { getPublicCompanyBySlug } from "@/server/services/companies/get-public-by-slug"
import { getCompanyTrustIndex } from "@/server/services/companies/trust-index"
import { listPublicOffersByCompany } from "@/server/services/offers/list-public-by-company"

type Params = Promise<{ slug: string }>

export default async function CompanyPublicProfilePage({
  params,
}: {
  params: Params
}) {
  const viewer = await requireRole([
    "student",
    "company_admin",
    "dept_head",
    "university_admin",
    "super_admin",
  ])
  const { slug } = await params

  const company = await getPublicCompanyBySlug(slug)
  if (!company) {
    notFound()
  }

  const [t, trustData, offers] = await Promise.all([
    getTranslations("companyPublic"),
    getCompanyTrustIndex(company.id).catch(() => null),
    listPublicOffersByCompany(company.id),
  ])

  const canOpenOffers = viewer.role === "student"
  const location = getWilayaName(company.wilayaCode)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <header className="border border-border/50 p-6 md:p-8 space-y-4">
          <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-primary [[dir=rtl]_&]:tracking-normal">
            {t("kicker")}
          </p>
          <div className="flex items-start gap-4">
            {company.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={company.logoUrl}
                alt={company.name}
                className="h-16 w-16 object-cover border border-border/50"
              />
            ) : (
              <div className="h-16 w-16 border border-border/50 bg-primary/10 flex items-center justify-center font-serif text-xl text-primary">
                {company.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="space-y-1">
              <h1 className="font-serif text-3xl leading-tight text-heading">{company.name}</h1>
              {location ? (
                <p className="text-sm text-muted-foreground">{location}</p>
              ) : null}
            </div>
          </div>

          {company.description ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{company.description}</p>
          ) : null}

          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {company.websiteUrl ? (
              <a href={company.websiteUrl} target="_blank" rel="noreferrer" className="underline">
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
          <h2 className="font-serif text-2xl text-heading">{t("openOffers")}</h2>
          {offers.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noOffers")}</p>
          ) : (
            <div className="space-y-3">
              {offers.map((offer) => {
                const content = (
                  <article className="border border-border/50 p-4 hover:border-primary/30 transition-colors">
                    <h3 className="font-serif text-lg text-heading">{offer.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {offer.internshipType} · {offer.maxPositions} {t("positions")}
                    </p>
                  </article>
                )

                if (!canOpenOffers) return <div key={offer.id}>{content}</div>

                return (
                  <Link key={offer.id} href={`/dashboard/student/offers/${offer.id}` as "/dashboard"}>
                    {content}
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
