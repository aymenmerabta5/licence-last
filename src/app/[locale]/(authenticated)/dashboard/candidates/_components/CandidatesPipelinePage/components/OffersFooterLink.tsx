import { ArrowRight } from "lucide-react"
import type { CandidatesDashboardTranslations } from "@/app/[locale]/(authenticated)/dashboard/candidates/_components/CandidatesPipelinePage/types"
import { Link } from "@/i18n/routing"

interface OffersFooterLinkProps {
  t: CandidatesDashboardTranslations
}

export function OffersFooterLink({ t }: OffersFooterLinkProps) {
  return (
    <div className="border-t border-border/50 pt-5">
      <Link
        href="/dashboard/company/offers"
        className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-primary"
      >
        {t("candidates.viewAllOffers")}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  )
}
