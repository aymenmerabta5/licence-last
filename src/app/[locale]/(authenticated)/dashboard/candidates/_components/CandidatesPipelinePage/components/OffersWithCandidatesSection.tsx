import { ArrowRight, Briefcase, Users } from "lucide-react"
import type {
  CandidatesDashboardOffer,
  CandidatesDashboardTranslations,
} from "@/app/[locale]/(authenticated)/dashboard/candidates/_components/CandidatesPipelinePage/types"
import { Badge } from "@/components/ui/badge"
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
    <section className="space-y-5">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <h2 className="font-serif text-xl tracking-tight text-heading">
          {t("candidates.offersWithCandidates")}
        </h2>
        {offers.length > 0 && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center bg-muted px-1.5 text-[10px] font-bold text-muted-foreground">
            {offers.length}
          </span>
        )}
      </div>

      {offers.length === 0 ? (
        <div className="border border-dashed border-border/60 p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center border border-border/50 bg-muted/30">
            <Users className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <div className="space-y-2">
            <p className="font-serif text-lg text-heading">
              {t("candidates.noCandidatesYet")}
            </p>
            <p className="text-sm font-light text-muted-foreground max-w-sm mx-auto">
              {t("candidates.noCandidatesDescription")}
            </p>
          </div>
          <Link
            href="/dashboard/company/offers"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-primary hover:underline"
          >
            {t("candidates.manageOffers")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <Link
              key={offer.id}
              href={
                `/dashboard/company/offers/${offer.id}/candidates` as "/dashboard"
              }
              className="group block"
            >
              <article className="border border-border/60 bg-card/30 dark:bg-card/50 p-5 transition-colors hover:border-primary/40 hover:bg-primary/[0.02] dark:hover:bg-primary/[0.04]">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-3">
                    {/* Title row */}
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-border/50 bg-muted/30 transition-colors group-hover:border-primary/30 group-hover:bg-primary/5">
                        <Briefcase className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <h3 className="truncate font-serif text-base text-heading transition-colors group-hover:text-primary">
                        {offer.title}
                      </h3>
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-2 ps-[42px]">
                      <Badge
                        variant={
                          offer.status === "published"
                            ? "editorial"
                            : "editorial-muted"
                        }
                        className="text-[9px]"
                      >
                        {t(`offers.status.${offer.status}`)}
                      </Badge>

                      <span className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                        {t(`offers.type.${offer.internshipType}`)}
                      </span>

                      <span className="text-muted-foreground/30">|</span>

                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {offer.candidatesCount}{" "}
                        {offer.candidatesCount === 1
                          ? t("candidates.candidate")
                          : t("candidates.candidates")}
                      </span>
                    </div>

                    {/* Skills */}
                    {offer.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 ps-[42px]">
                        {offer.skills.slice(0, 5).map((skill) => (
                          <span
                            key={skill.id}
                            className="inline-flex items-center border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary/80"
                          >
                            {skill.name}
                          </span>
                        ))}
                        {offer.skills.length > 5 && (
                          <span className="inline-flex items-center px-1 text-[10px] text-muted-foreground">
                            +{offer.skills.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="h-4 w-4 shrink-0 mt-2 text-muted-foreground/40 transition-all group-hover:text-primary group-hover:translate-x-0.5" />
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
