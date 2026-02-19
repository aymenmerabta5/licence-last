import type { CandidatesDashboardTranslations } from "@/app/[locale]/(authenticated)/dashboard/candidates/_components/CandidatesPipelinePage/types"

interface CandidatesHeaderProps {
  totalCandidates: number
  t: CandidatesDashboardTranslations
}

export function CandidatesHeader({
  totalCandidates,
  t,
}: CandidatesHeaderProps) {
  return (
    <div className="space-y-2">
      <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight text-heading">
        {t("candidates.title")}
      </h1>
      <p className="text-sm font-light tracking-wide text-muted-foreground">
        {t("candidates.description", { count: totalCandidates })}
      </p>
    </div>
  )
}
