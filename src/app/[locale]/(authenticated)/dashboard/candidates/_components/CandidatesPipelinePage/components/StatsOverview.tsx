import { Briefcase, Radio, Users } from "lucide-react"
import type { CandidatesDashboardTranslations } from "@/app/[locale]/(authenticated)/dashboard/candidates/_components/CandidatesPipelinePage/types"

interface StatsOverviewProps {
  offersCount: number
  activeOffersCount: number
  totalCandidates: number
  t: CandidatesDashboardTranslations
}

export function StatsOverview({
  offersCount,
  activeOffersCount,
  totalCandidates,
  t,
}: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        icon={Briefcase}
        label={t("candidates.stats.totalOffers")}
        value={offersCount}
      />
      <StatCard
        icon={Radio}
        label={t("candidates.stats.activeOffers")}
        value={activeOffersCount}
        iconClass="text-emerald-500 dark:text-emerald-400"
      />
      <StatCard
        icon={Users}
        label={t("candidates.stats.totalCandidates")}
        value={totalCandidates}
        valueClass="text-primary"
        iconClass="text-primary"
      />
    </div>
  )
}

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: number
  valueClass?: string
  iconClass?: string
}

function StatCard({
  icon: Icon,
  label,
  value,
  valueClass,
  iconClass,
}: StatCardProps) {
  return (
    <div className="border border-border/60 bg-card/30 dark:bg-card/50 p-5">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </span>
        <Icon
          className={`h-4 w-4 ${iconClass ?? "text-muted-foreground/50"}`}
        />
      </div>
      <div
        className={`mt-2 font-serif text-3xl tracking-tight ${valueClass ?? "text-heading"}`}
      >
        {value}
      </div>
    </div>
  )
}
