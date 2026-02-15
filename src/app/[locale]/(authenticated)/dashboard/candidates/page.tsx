import { getTranslations } from "next-intl/server"

import { requireRole } from "@/lib/auth-guards"
import { getCompanyByUserId } from "@/server/services/companies/get"
import { listOffersByCompany } from "@/server/services/offers/list-by-company"
import { Link } from "@/i18n/routing"
import { localeRedirect } from "@/lib/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Users, ArrowRight } from "lucide-react"

export default async function CandidatesPipelinePage() {
  const user = await requireRole(["company_admin"])

  const company = await getCompanyByUserId(user.id)

  if (!company) {
    return localeRedirect("/dashboard/company/profile")
  }

  const t = await getTranslations("dashboard")
  const offers = await listOffersByCompany(company.id)

  // Filter offers that have candidates
  const offersWithCandidates = offers.filter((offer) => offer.candidatesCount > 0)

  const totalCandidates = offersWithCandidates.reduce(
    (sum, offer) => sum + offer.candidatesCount,
    0
  )

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight text-heading">
          {t("candidates.title")}
        </h1>
        <p className="text-muted-foreground text-sm font-light tracking-wide">
          {t("candidates.description", { count: totalCandidates })}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("candidates.stats.totalOffers")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-heading">{offers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("candidates.stats.activeOffers")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-heading">
              {offers.filter((o) => o.status === "published").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("candidates.stats.totalCandidates")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-primary">{totalCandidates}</div>
          </CardContent>
        </Card>
      </div>

      {/* Offers with Candidates */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl text-heading tracking-tight">
          {t("candidates.offersWithCandidates")}
        </h2>

        {offersWithCandidates.length === 0 ? (
          <div className="border border-dashed border-border p-12 text-center space-y-4">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">
                {t("candidates.noCandidatesYet")}
              </p>
              <p className="text-xs text-muted-foreground/70">
                {t("candidates.noCandidatesDescription")}
              </p>
            </div>
            <Link
              href="/dashboard/company/offers"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              {t("candidates.manageOffers")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {offersWithCandidates.map((offer) => (
              <Link
                key={offer.id}
                href={`/dashboard/company/offers/${offer.id}/candidates` as "/dashboard"}
              >
                <Card className="hover:border-primary/50 transition-colors group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-serif text-lg text-heading group-hover:text-primary transition-colors truncate">
                            {offer.title}
                          </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant={offer.status === "published" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {t(`offers.status.${offer.status}`)}
                          </Badge>

                          {offer.skills.slice(0, 4).map((skill) => (
                            <span
                              key={skill.id}
                              className="inline-flex items-center px-2 py-0.5 text-[10px] bg-primary/10 text-primary"
                            >
                              {skill.name}
                            </span>
                          ))}
                          {offer.skills.length > 4 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{offer.skills.length - 4}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {offer.candidatesCount}{" "}
                            {offer.candidatesCount === 1
                              ? t("candidates.candidate")
                              : t("candidates.candidates")}
                          </span>
                          <span>•</span>
                          <span>{t(`offers.type.${offer.internshipType}`)}</span>
                        </div>
                      </div>

                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* All Offers Link */}
      <div className="pt-4 border-t border-border">
        <Link
          href="/dashboard/company/offers"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {t("candidates.viewAllOffers")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
