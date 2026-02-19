import { ArrowRight, Briefcase, Users } from "lucide-react"
import type {
  CandidatesDashboardOffer,
  CandidatesDashboardTranslations,
} from "@/app/[locale]/(authenticated)/dashboard/candidates/_components/CandidatesPipelinePage/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Link } from "@/i18n/routing"

interface OffersWithCandidatesSectionProps {
  offers: CandidatesDashboardOffer[]
  t: CandidatesDashboardTranslations
}

export function OffersWithCandidatesSection({
  offers,
  t,
}: OffersWithCandidatesSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-xl tracking-tight text-heading">
        {t("candidates.offersWithCandidates")}
      </h2>

      {offers.length === 0 ? (
        <div className="space-y-4 border border-dashed border-border p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
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
          {offers.map((offer) => (
            <Link
              key={offer.id}
              href={
                `/dashboard/company/offers/${offer.id}/candidates` as "/dashboard"
              }
            >
              <Card className="group transition-colors hover:border-primary/50">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <h3 className="truncate font-serif text-lg text-heading transition-colors group-hover:text-primary">
                          {offer.title}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={
                            offer.status === "published"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {t(`offers.status.${offer.status}`)}
                        </Badge>

                        {offer.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill.id}
                            className="inline-flex items-center bg-primary/10 px-2 py-0.5 text-[10px] text-primary"
                          >
                            {skill.name}
                          </span>
                        ))}
                        {offer.skills.length > 4 ? (
                          <span className="text-[10px] text-muted-foreground">
                            +{offer.skills.length - 4}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {offer.candidatesCount}{" "}
                          {offer.candidatesCount === 1
                            ? t("candidates.candidate")
                            : t("candidates.candidates")}
                        </span>
                        <span>&middot;</span>
                        <span>{t(`offers.type.${offer.internshipType}`)}</span>
                      </div>
                    </div>

                    <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
