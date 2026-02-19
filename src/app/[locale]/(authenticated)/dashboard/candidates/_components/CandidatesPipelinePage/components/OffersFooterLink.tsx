import { ArrowRight } from "lucide-react"

import { Link } from "@/i18n/routing"

import type { CandidatesDashboardTranslations } from "@/app/[locale]/(authenticated)/dashboard/candidates/_components/CandidatesPipelinePage/types"

interface OffersFooterLinkProps {
  t: CandidatesDashboardTranslations
}

export function OffersFooterLink({ t }: OffersFooterLinkProps) {
  return (
    <div className="border-t border-border pt-4">
      <Link
        href="/dashboard/company/offers"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        {t("candidates.viewAllOffers")}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
